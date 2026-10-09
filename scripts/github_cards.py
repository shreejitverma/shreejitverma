"""Render the README's GitHub stats and language cards from github-stats.json.

Writes card.stats.{light,dark}.svg and card.languages.{light,dark}.svg. The
cards are plain SVG (no foreignObject, no external fonts or images), so they
render the same through GitHub's image proxy and in any browser.

    python3 scripts/github_cards.py <github-stats.json> <out-dir>
"""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

WIDTH = 495
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

# GitHub Primer colors, so the cards sit naturally on github.com.
THEMES = {
    "light": {
        "bg": "#ffffff",
        "border": "#d0d7de",
        "title": "#1f2328",
        "text": "#1f2328",
        "muted": "#656d76",
        "accent": "#0969da",
        "track": "#eaeef2",
    },
    "dark": {
        "bg": "#0d1117",
        "border": "#30363d",
        "title": "#e6edf3",
        "text": "#e6edf3",
        "muted": "#7d8590",
        "accent": "#2f81f7",
        "track": "#21262d",
    },
}

OTHER_COLOR = "#8b949e"


def fmt(value: int) -> str:
    return f"{value:,}"


def updated_on(stats: dict) -> str:
    stamp = datetime.fromisoformat(stats["generatedAt"])
    return f"{stamp:%b} {stamp.day}, {stamp.year}"


def frame(height: int, theme: dict, title: str, body: list[str], label: str) -> str:
    return "\n".join(
        [
            (
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" '
                f'viewBox="0 0 {WIDTH} {height}" role="img" aria-label="{escape(label)}">'
            ),
            f"<title>{escape(label)}</title>",
            (
                f'<rect x="0.5" y="0.5" width="{WIDTH - 1}" height="{height - 1}" rx="6" '
                f'fill="{theme["bg"]}" stroke="{theme["border"]}"/>'
            ),
            f'<g font-family="{FONT}">',
            (
                f'<text x="24" y="38" font-size="17" font-weight="600" fill="{theme["title"]}">'
                f"{escape(title)}</text>"
            ),
            *body,
            "</g>",
            "</svg>",
            "",
        ]
    )


def stats_card(stats: dict, theme: dict) -> str:
    last_year = stats["lastYear"]
    rows = [
        ("Contributions", fmt(last_year["contributions"])),
        ("Commits", fmt(last_year["commits"])),
        ("Pull requests opened", fmt(last_year["pullRequests"])),
        ("Repositories committed to", fmt(last_year["repositoriesContributedTo"])),
        ("Pull requests merged, all time", fmt(stats["pullRequests"]["merged"])),
        (
            "Current / longest streak",
            f"{stats['streak']['current']} / {stats['streak']['longest']} days",
        ),
        ("Public repositories", fmt(stats["repositories"]["public"])),
        ("Stars earned", fmt(stats["repositories"]["stars"])),
    ]
    body = [
        (
            f'<text x="24" y="60" font-size="12" fill="{theme["muted"]}">'
            "Last 12 months, public and private repositories</text>"
        )
    ]
    top, step = 90, 44
    for index, (label, value) in enumerate(rows):
        column, row = divmod(index, 4)
        x = 24 + column * 236
        y = top + row * step
        body.append(
            f'<text x="{x}" y="{y}" font-size="12" fill="{theme["muted"]}">'
            f"{escape(label)}</text>"
        )
        body.append(
            f'<text x="{x}" y="{y + 19}" font-size="16" font-weight="600" '
            f'fill="{theme["text"]}">{escape(value)}</text>'
        )
    height = top + 3 * step + 62
    body.append(
        f'<text x="24" y="{height - 16}" font-size="11" fill="{theme["muted"]}">'
        f"Updated {escape(updated_on(stats))} from the GitHub API</text>"
    )
    label = (
        f"GitHub activity: {fmt(last_year['contributions'])} contributions and "
        f"{fmt(last_year['commits'])} commits in the last 12 months"
    )
    return frame(height, theme, "GitHub activity", body, label)


def languages_card(stats: dict, theme: dict) -> str:
    languages = stats["languages"]
    body = [
        (
            f'<text x="24" y="60" font-size="12" fill="{theme["muted"]}">'
            "Share of commits in the last 12 months, by language</text>"
        )
    ]
    bar_x, bar_y, bar_w, bar_h = 24, 76, WIDTH - 48, 10
    body.append(
        f'<clipPath id="bar"><rect x="{bar_x}" y="{bar_y}" width="{bar_w}" '
        f'height="{bar_h}" rx="5"/></clipPath>'
    )
    body.append(
        f'<rect x="{bar_x}" y="{bar_y}" width="{bar_w}" height="{bar_h}" rx="5" '
        f'fill="{theme["track"]}"/>'
    )
    body.append('<g clip-path="url(#bar)">')
    offset = 0.0
    for language in languages:
        width = language["share"] * bar_w
        color = language["color"] or OTHER_COLOR
        body.append(
            f'<rect x="{bar_x + offset:.2f}" y="{bar_y}" width="{width:.2f}" '
            f'height="{bar_h}" fill="{color}"/>'
        )
        offset += width
    body.append("</g>")

    top, step = 112, 24
    rows = (len(languages) + 1) // 2
    for index, language in enumerate(languages):
        column, row = divmod(index, rows)
        x = 24 + column * 236
        y = top + row * step
        color = language["color"] or OTHER_COLOR
        body.append(f'<circle cx="{x + 5}" cy="{y - 4}" r="5" fill="{color}"/>')
        body.append(
            f'<text x="{x + 18}" y="{y}" font-size="13" fill="{theme["text"]}">'
            f"{escape(language['name'])}</text>"
        )
        body.append(
            f'<text x="{x + 200}" y="{y}" font-size="13" text-anchor="end" '
            f'fill="{theme["muted"]}">{language["share"] * 100:.1f}%</text>'
        )
    height = top + max(rows - 1, 0) * step + 44
    body.append(
        f'<text x="24" y="{height - 16}" font-size="11" fill="{theme["muted"]}">'
        "Commits split by each repository's language mix; markup excluded</text>"
    )
    summary = ", ".join(
        f"{language['name']} {language['share'] * 100:.0f}%" for language in languages
    )
    return frame(
        height, theme, "Languages", body, f"Languages by commit share: {summary}"
    )


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    stats = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    out = Path(argv[2])
    out.mkdir(parents=True, exist_ok=True)
    if not stats.get("languages"):
        print("github-stats.json has no languages", file=sys.stderr)
        return 1
    for name, theme in THEMES.items():
        (out / f"card.stats.{name}.svg").write_text(
            stats_card(stats, theme), encoding="utf-8"
        )
        (out / f"card.languages.{name}.svg").write_text(
            languages_card(stats, theme), encoding="utf-8"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
