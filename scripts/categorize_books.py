#!/usr/bin/env python3
"""Reclassify books into proper categories.

Three layers are applied per book, in order:
1. scripts/category_overrides.json - a hand-curated exact-title map that is
   authoritative for every book, whatever its current category.
2. FAMILY_RULES - regexes over the raw title for whole families of entries
   (school textbooks, Hindu scriptures, GPS/mapping papers, dictionaries).
3. RULES - ordered keyword rules; the first category whose keywords match the
   book's title or genre wins.
Layers 2 and 3 only lift books out of the 'General' bucket, titles matching
DOCUMENT_PATTERN (personal documents such as brochures, receipts, and reports)
deliberately stay there, and books matching nothing stay 'General'.

Usage: python3 scripts/categorize_books.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata

DATA_PATH = "public/books_data_validated.json"

# Ordered: more specific domains first so e.g. "Trading Psychology" lands in
# Finance rather than Psychology.
RULES: list[tuple[str, list[str]]] = [
    (
        "Finance & Trading",
        [
            "trading", "trader", "invest", "stock", "forex", "candlestick", "option",
            "portfolio", "hedge fund", "wall street", "financ", "valuation", "accounting",
            "economi", "wealth", "money", "market", "crypto", "bitcoin", "derivative",
            "bonds", "dividend", "ipo", "commodit", "quant",
        ],
    ),
    (
        "Computer Science & Data",
        [
            "python", "c++", "java", "javascript", "typescript", "programming", "coding",
            "software", "algorithm", "machine learning", "deep learning", "data science",
            "artificial intelligence", " ai ", "sql", "linux", "kubernetes", "docker",
            "network", "computer", "hacking", "cybersecurity", "web develop", "cloud",
            "database", "excel", "blockchain",
        ],
    ),
    (
        "Science & Math",
        [
            "physics", "mathematic", "calculus", "statistic", "probability", "chemistry",
            "biology", "quantum", "universe", "cosmos", "evolution", "genome", "science",
            "engineering", "astronom", "relativity", "geometry", "algebra",
        ],
    ),
    (
        "Business & Leadership",
        [
            "business", "startup", "entrepreneur", "management", "leadership", "marketing",
            "sales", "negotiat", "strategy", "ceo", "company", "corporate", "innovation",
            "brand", "customer",
        ],
    ),
    (
        "Self-Help & Psychology",
        [
            "habit", "self-", "self ", "psycholog", "mindset", "thinking", "motivat",
            "confidence", "happiness", "productivity", "discipline", "procrastin",
            "anxiety", "emotional", "memory", "focus", "willpower", "charisma",
            "influence", "persuasion", "communication", "relationship",
        ],
    ),
    (
        "Philosophy & Spirituality",
        [
            "philosoph", "stoic", "zen", "buddh", "spiritual", "gita", "veda", "upanishad",
            "tao", "meditat", "religion", "god", "consciousness", "yoga", "mindful",
            "enlighten", "krishna", "bible", "quran",
        ],
    ),
    (
        "History & Geopolitics",
        [
            "history", "war", "empire", "geopolit", "politic", "civilization", "revolution",
            "world order", "nations", "dynasty", "ancient", "biography", "hitler",
            "churchill", "gandhi", "india", "china", "america", "sapiens",
        ],
    ),
    (
        "Fiction & Literature",
        [
            "novel", "fiction", "a story", "stories", "tales", "shakespeare", "poem",
            "poetry", "literature", "sherlock", "harry potter", "trilogy",
        ],
    ),
]


# Family rules: regexes matched against the raw title for whole families of
# entries. Checked before keyword rules.
FAMILY_RULES: list[tuple[str, str]] = [
    (r"(?i)^(class-\d|Lecture \d|Oswaal CBSE|Class-1\d)", "Education & Reference"),
    (r"(?i)^Oxford (Dictionary|English|Hachette|Paravia|Spanish)", "Education & Reference"),
    (r"(?i)(french|sanskrit language|english grammar|dictionary of|writing guide|elements of style)", "Education & Reference"),
    (r"(?i)(puran|-?ved($|-|\b)|rigved|samved|yajurved|atharva|geeta|gita|mahabharat|ramcharitmanas|samhita|saptashati|upanishad|siddhanta|tantra|kurukshetra|कुरुक्षेत्र)", "Philosophy & Spirituality"),
    (r"(?i)(gps trace|road map|street map|map (inference|comparison|refinement)|kalman|postgis|spatial trajector|information retrieval|design.?patterns|pragmatic programmer|graph bundling|crowd sourcing|constructing maps)", "Computer Science & Data"),
]

# Personal documents and non-book files that should stay in General.
DOCUMENT_PATTERN = re.compile(
    r"(?i)(brochure|report|receipt|certificate|form\b|policy|proof|snapshot|application"
    r"|affidavi|nominee|passport|linkedin|newsletter|yearbook|calendar|toolkit|test\b"
    r"|illustration|prospectus|proposal|21-22-\d|^2015\.\d)"
)

OVERRIDES_PATH = "scripts/category_overrides.json"


def load_overrides() -> dict[str, str]:
    try:
        with open(OVERRIDES_PATH) as fh:
            return {
                unicodedata.normalize("NFC", key): value
                for key, value in json.load(fh).items()
            }
    except FileNotFoundError:
        sys.exit(
            f"error: overrides file {OVERRIDES_PATH!r} not found; "
            "it holds the authoritative hand-curated categories and must exist"
        )


def classify(book: dict) -> str | None:
    # Title and genre only: descriptions include synthesized text mentioning
    # "quantitative finance", which would misclassify everything as Finance.
    haystack = " ".join(
        str(book.get(key) or "") for key in ("title", "genre")
    ).lower()
    haystack = re.sub(r"[_\-:]", " ", haystack)
    for category, keywords in RULES:
        if any(kw in haystack for kw in keywords):
            return category
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    with open(DATA_PATH) as fh:
        data = json.load(fh)

    overrides = load_overrides()
    moved: dict[str, int] = {}
    for book in data:
        title = unicodedata.normalize("NFC", (book.get("title") or "").strip())
        current = (book.get("category") or "").strip()
        # Overrides are authoritative for any book; other rules only lift
        # books out of the General bucket.
        if title in overrides:
            if overrides[title] != current:
                book["category"] = overrides[title]
                moved[overrides[title]] = moved.get(overrides[title], 0) + 1
            continue
        if current != "General":
            continue
        target: str | None = None
        if not DOCUMENT_PATTERN.search(title):
            for pattern, category in FAMILY_RULES:
                if re.search(pattern, title):
                    target = category
                    break
            if target is None:
                target = classify(book)
        if target:
            book["category"] = target
            moved[target] = moved.get(target, 0) + 1

    remaining = sum(1 for b in data if (b.get("category") or "").strip() == "General")
    total_moved = sum(moved.values())
    print(f"reclassified {total_moved} of {total_moved + remaining} General books:")
    for category, count in sorted(moved.items(), key=lambda item: -item[1]):
        print(f"  +{count:4d}  {category}")
    print(f"  {remaining} remain General")

    if not args.dry_run:
        with open(DATA_PATH, "w") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=1)
            fh.write("\n")
        print("saved")
    return 0


if __name__ == "__main__":
    sys.exit(main())
