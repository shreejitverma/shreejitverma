"""Unit tests for scripts/github_stats.py and scripts/github_cards.py.

python3 -m unittest discover -s scripts/tests
"""

import sys
import unittest
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from github_cards import THEMES, WIDTH, languages_card, stats_card
from github_stats import language_shares, streaks


def repo(commits, *languages):
    return {
        "contributions": {"totalCount": commits},
        "repository": {
            "languages": {
                "edges": [
                    {"size": size, "node": {"name": name, "color": color}}
                    for name, color, size in languages
                ]
            }
        },
    }


class StreaksTest(unittest.TestCase):
    def test_empty_calendar(self):
        self.assertEqual(streaks([]), (0, 0))

    def test_today_without_contributions_keeps_the_streak(self):
        self.assertEqual(streaks([1, 1, 0]), (2, 2))

    def test_gap_resets_current_but_not_longest(self):
        self.assertEqual(streaks([1, 1, 1, 0, 1]), (1, 3))

    def test_two_idle_days_end_the_streak(self):
        self.assertEqual(streaks([2, 0, 0]), (0, 1))


class LanguageSharesTest(unittest.TestCase):
    def test_worked_example(self):
        # Repo A: 10 commits, 3:1 C++:Python bytes -> C++ 7.5, Python 2.5.
        # Repo B: 30 commits, notebook plus HTML; HTML is markup and dropped,
        # the notebook counts as Python -> Python 30.
        # Repo C: no commits, ignored. Total 40: Python 32.5, C++ 7.5.
        shares = language_shares(
            [
                repo(10, ("C++", "#f34b7d", 300), ("Python", "#3572A5", 100)),
                repo(
                    30,
                    ("Jupyter Notebook", "#DA5B0B", 500),
                    ("HTML", "#e34c26", 1000),
                ),
                repo(0, ("Go", "#00ADD8", 999)),
            ]
        )
        self.assertEqual(
            shares,
            [
                {"name": "Python", "color": "#3572A5", "share": 0.8125},
                {"name": "C++", "color": "#f34b7d", "share": 0.1875},
            ],
        )

    def test_notebook_only_python_gets_python_color(self):
        shares = language_shares([repo(5, ("Jupyter Notebook", "#DA5B0B", 10))])
        self.assertEqual(shares, [{"name": "Python", "color": "#3572A5", "share": 1.0}])

    def test_long_tail_is_grouped_as_other(self):
        languages = [(f"L{i}", "#000000", 100) for i in range(10)]
        shares = language_shares([repo(10, *languages)])
        self.assertEqual(len(shares), 9)
        self.assertEqual(shares[-1]["name"], "Other")
        self.assertAlmostEqual(shares[-1]["share"], 0.2)
        self.assertAlmostEqual(sum(item["share"] for item in shares), 1.0)

    def test_no_commits_means_no_languages(self):
        self.assertEqual(language_shares([repo(0, ("C++", "#f34b7d", 10))]), [])


STATS = {
    "generatedAt": "2026-10-09T18:10:58+00:00",
    "memberSince": 2017,
    "lastYear": {
        "contributions": 2719,
        "commits": 2458,
        "pullRequests": 194,
        "reviews": 0,
        "issues": 7,
        "repositoriesContributedTo": 77,
        "restrictedContributions": 0,
    },
    "streak": {"current": 4, "longest": 9},
    "pullRequests": {"merged": 188, "open": 2, "closed": 5},
    "repositories": {"public": 66, "stars": 189, "forks": 89},
    "followers": 86,
    "languages": [
        {"name": "C++ & <Co>", "color": "#f34b7d", "share": 0.6},
        {"name": "Other", "color": None, "share": 0.4},
    ],
}


class CardsTest(unittest.TestCase):
    def test_cards_are_well_formed_svg_with_the_numbers(self):
        for theme in THEMES.values():
            stats_svg = stats_card(STATS, theme)
            languages_svg = languages_card(STATS, theme)
            # Raises if the markup is malformed, e.g. an unescaped name.
            ElementTree.fromstring(stats_svg)
            ElementTree.fromstring(languages_svg)
            self.assertIn(">2,719<", stats_svg)
            self.assertIn(">4 / 9 days<", stats_svg)
            self.assertIn("C++ &amp; &lt;Co&gt;", languages_svg)
            self.assertIn(">60.0%<", languages_svg)
            self.assertIn("Updated Oct 9, 2026", stats_svg)
            self.assertIn(">194 / 7<", stats_svg)
            self.assertIn(">189 / 89<", stats_svg)
            self.assertNotIn("Code reviews", stats_svg)

    def test_reviews_row_appears_only_when_nonzero_and_stays_inside_the_card(self):
        with_reviews = {**STATS, "lastYear": {**STATS["lastYear"], "reviews": 12}}
        for stats in (STATS, with_reviews):
            root = ElementTree.fromstring(stats_card(stats, THEMES["light"]))
            texts = list(root.iter("{http://www.w3.org/2000/svg}text"))
            values = [element.text for element in texts]
            if stats is with_reviews:
                self.assertEqual(values[values.index("Code reviews") + 1], "12")
            else:
                self.assertNotIn("Code reviews", values)
            # Nine rows must still fit two columns inside the card.
            for element in texts:
                self.assertLess(float(element.get("x")), WIDTH, element.text)
                self.assertLess(
                    float(element.get("y")), float(root.get("height")), element.text
                )


if __name__ == "__main__":
    unittest.main()
