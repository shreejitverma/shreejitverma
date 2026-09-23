#!/usr/bin/env python3
"""Import curated book covers from the Obsidian vault into the website.

The vault keeps one note per book under Reading/Library/ whose frontmatter
records title, author, and a local cover image (Attachments/Covers/...). This
script matches those notes to entries in public/books_data_validated.json,
converts each matched cover to a 320px-wide WebP under public/covers/, and
points the entry's coverImage at the self-hosted copy.

Matching is deliberately conservative; a book keeps its current cover unless
one vault note identifies it unambiguously:
  exact   normalized titles are equal
  prefix  one title is a prefix of the other (shorter side >= 12 chars)
  main    main titles (before the subtitle) are equal and both authors agree
  fuzzy   title similarity >= 0.88 and both authors agree
Every tier rejects a known author conflict. Prefixes must end on a word
boundary. Site entries listed under "skip" in scripts/cover_overrides.json
(exact site titles, each with a reason) are never touched: anonymous files
whose generic title fits several books. Covers the vault marks as
`cover_source: generated` are typeset title cards, not real covers, and are
skipped. A site book matched by several notes with different covers is left
unchanged, unless exactly one of those notes matched its title exactly.

Output files are named by a hash of the source image, so they are safe to
serve with immutable caching. The run is idempotent: re-running with an
unchanged vault changes nothing, and covers no longer referenced are removed.

Usage: python3 scripts/import_vault_covers.py [--vault PATH] [--dry-run]
Requires: cwebp (brew install webp)
"""

from __future__ import annotations

import argparse
import collections
import difflib
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

DEFAULT_VAULT = os.path.expanduser(
    "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/shreejit-verma-obsidian"
)
DATA_PATH = "public/books_data_validated.json"
COVERS_DIR = "public/covers"
COVERS_URL = "/covers"
WIDTH_PX = 320
QUALITY = 82
PREFIX_MIN_LEN = 12
FUZZY_CUTOFF = 0.88
OVERRIDES_PATH = "scripts/cover_overrides.json"
UNKNOWN_AUTHORS = {"", "unknown", "unknown author", "various", "anonymous", "na", "n a"}


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    text = text.lower().replace("_", " ").replace("&", " and ")
    text = re.sub(r"[^a-z0-9 ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def main_title(raw: str) -> str:
    """Title before the subtitle; site titles come from filenames, where ':' became '_'."""
    return norm(re.split(r"\s*[:_]\s|\s-\s", raw or "", maxsplit=1)[0])


def author_tokens(author: str) -> set[str]:
    normalized = norm(author)
    if normalized in UNKNOWN_AUTHORS:
        return set()
    return {token for token in normalized.split() if len(token) > 2}


def authors_relation(note: dict, book: dict) -> str:
    """'agree', 'unknown' (either side missing), or 'conflict'."""
    mine, theirs = author_tokens(note["author"]), author_tokens(book.get("author", ""))
    if not mine or not theirs:
        return "unknown"
    if mine & theirs:
        return "agree"
    # Filename parsing sometimes put part of the title in the author field
    # ("The Righteous Mind Why Good People Are Divided / Politics and Religion").
    if theirs <= set(norm(note["title"]).split()):
        return "agree"
    return "conflict"


def read_frontmatter(path: str) -> dict | None:
    with open(path, encoding="utf-8", errors="replace") as fh:
        text = fh.read()
    match = re.match(r"---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None
    block = match.group(1)

    def field(key: str) -> str:
        found = re.search(rf"^{key}:\s*(.*)$", block, re.MULTILINE)
        return found.group(1).strip().strip('"').strip("'") if found else ""

    return {
        key: field(key) for key in ("type", "title", "author", "cover", "cover_source")
    }


def load_notes(vault: str) -> tuple[list[dict], collections.Counter]:
    skipped: collections.Counter = collections.Counter()
    notes = []
    for path in sorted(
        glob.glob(os.path.join(vault, "Reading/Library/**/*.md"), recursive=True)
    ):
        meta = read_frontmatter(path)
        if not meta or meta["type"] != "book":
            continue
        if not norm(meta["title"]):
            skipped["empty title"] += 1
            continue
        if not meta["cover"]:
            skipped["no cover"] += 1
            continue
        if meta["cover_source"] == "generated" or meta["cover"].lower().endswith(
            ".svg"
        ):
            skipped["generated title card, not a real cover"] += 1
            continue
        cover_path = os.path.join(vault, meta["cover"])
        if not os.path.isfile(cover_path):
            skipped["cover file missing"] += 1
            continue
        meta["cover_path"] = cover_path
        meta["note"] = os.path.relpath(path, vault)
        notes.append(meta)
    return notes, skipped


def match_note(note: dict, books: list[dict], index: dict) -> tuple[str, list[int]]:
    title = norm(note["title"])
    candidates: list[int] = []
    tier = ""
    if title in index["exact"]:
        tier, candidates = "exact", index["exact"][title]
    else:
        prefix = [
            i
            for site_title, i in index["titles"]
            if len(min(site_title, title, key=len)) >= PREFIX_MIN_LEN
            and (
                site_title.startswith(title + " ") or title.startswith(site_title + " ")
            )
        ]
        if prefix:
            tier, candidates = "prefix", prefix
        else:
            main = main_title(note["title"])
            by_main = index["main"].get(main, []) if len(main) >= PREFIX_MIN_LEN else []
            if by_main:
                tier, candidates = "main", by_main
            else:
                close = difflib.get_close_matches(
                    title, index["exact"].keys(), n=1, cutoff=FUZZY_CUTOFF
                )
                if close:
                    tier, candidates = "fuzzy", index["exact"][close[0]]
    if not candidates:
        return "no match", []
    relations = {i: authors_relation(note, books[i]) for i in candidates}
    needs_agreement = tier in ("main", "fuzzy")

    accepted = [
        i
        for i, rel in relations.items()
        if rel == "agree" or (rel == "unknown" and not needs_agreement)
    ]
    if not accepted:
        return f"{tier}: author conflict or unconfirmed", []
    return tier, accepted


def convert(src: str, dest: str) -> None:
    subprocess.run(
        [
            "cwebp",
            "-quiet",
            "-q",
            str(QUALITY),
            "-resize",
            str(WIDTH_PX),
            "0",
            "-metadata",
            "none",
            src,
            "-o",
            dest,
        ],
        check=True,
    )


def file_digest(path: str) -> str:
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()[:10]


def slug(text: str) -> str:
    return re.sub(r"-+", "-", norm(text).replace(" ", "-"))[:60].strip("-") or "book"


def write_json_atomic(path: str, data: list) -> None:
    directory = os.path.dirname(os.path.abspath(path))
    fd, tmp = tempfile.mkstemp(dir=directory, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    os.replace(tmp, path)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--vault", default=DEFAULT_VAULT)
    parser.add_argument("--data", default=DATA_PATH)
    parser.add_argument(
        "--dry-run", action="store_true", help="report matches without writing files"
    )
    args = parser.parse_args()

    if not os.path.isdir(args.vault):
        print(f"error: vault not found: {args.vault}", file=sys.stderr)
        return 2
    if not args.dry_run and shutil.which("cwebp") is None:
        print("error: cwebp not found (brew install webp)", file=sys.stderr)
        return 2

    with open(args.data, encoding="utf-8") as fh:
        books = json.load(fh)
    with open(OVERRIDES_PATH, encoding="utf-8") as fh:
        skip_titles = set(json.load(fh)["skip"])
    index = {
        "exact": collections.defaultdict(list),
        "main": collections.defaultdict(list),
        "titles": [],
    }
    for i, book in enumerate(books):
        title = norm(book.get("title", ""))
        if book.get("title") in skip_titles:
            continue
        if not title:
            continue  # e.g. non-Latin titles normalize to nothing; never match on an empty key
        index["exact"][title].append(i)
        index["main"][main_title(book["title"])].append(i)
        index["titles"].append((title, i))

    notes, skipped = load_notes(args.vault)
    tiers: collections.Counter = collections.Counter()
    claims: dict[int, list[tuple[str, dict]]] = collections.defaultdict(list)
    for note in notes:
        tier, matched = match_note(note, books, index)
        tiers[tier] += 1
        for i in matched:
            claims[i].append((tier, note))

    assignments: dict[int, dict] = {}
    ambiguous = []
    for i, claimants in claims.items():
        if len({note["cover_path"] for _, note in claimants}) > 1:
            exact = [note for tier, note in claimants if tier == "exact"]
            if len(exact) != 1:
                ambiguous.append(
                    (books[i]["title"], sorted(note["title"] for _, note in claimants))
                )
                continue
            claimants = [("exact", exact[0])]
        assignments[i] = claimants[0][1]

    # Convert each distinct source cover once; name outputs by source hash.
    outputs: dict[str, str] = {}
    if not args.dry_run:
        os.makedirs(COVERS_DIR, exist_ok=True)
    for note in {id(n): n for n in assignments.values()}.values():
        src = note["cover_path"]
        if src in outputs:
            continue
        name = f"{slug(note['title'])}-{file_digest(src)}.webp"
        outputs[src] = name
        dest = os.path.join(COVERS_DIR, name)
        if not args.dry_run and not os.path.exists(dest):
            convert(src, dest)

    changed = replaced = added = 0
    for i, note in assignments.items():
        url = f"{COVERS_URL}/{outputs[note['cover_path']]}"
        book = books[i]
        if book.get("coverImage") == url:
            continue
        if (book.get("coverImage") or "").strip():
            replaced += 1
        else:
            added += 1
        book["coverImage"] = url
        changed += 1

    referenced = {
        os.path.basename(b["coverImage"])
        for b in books
        if (b.get("coverImage") or "").startswith(COVERS_URL + "/")
    }
    orphans = (
        sorted(set(os.listdir(COVERS_DIR)) - referenced)
        if os.path.isdir(COVERS_DIR)
        else []
    )
    if not args.dry_run:
        for name in orphans:
            os.remove(os.path.join(COVERS_DIR, name))
        if changed:
            write_json_atomic(args.data, books)

    with_cover = sum(1 for b in books if (b.get("coverImage") or "").strip())
    print(f"vault book notes usable: {len(notes)}  skipped: {dict(skipped)}")
    print(f"match tiers: {dict(tiers)}")
    print(
        f"site books matched: {len(assignments)}  ambiguous (left unchanged): {len(ambiguous)}"
    )
    print(
        f"cover files: {len(outputs)}  orphans {'found' if args.dry_run else 'removed'}: {len(orphans)}"
    )
    print(
        f"entries changed: {changed} (new cover: {added}, replaced hotlink: {replaced})"
    )
    print(
        f"site books with a cover: {with_cover}/{len(books)} ({with_cover / len(books):.1%})"
    )
    for title, claimants in ambiguous:
        print(f"  ambiguous: {title!r} <- {claimants}")
    if args.dry_run:
        print("dry run: no files written")
    return 0


if __name__ == "__main__":
    sys.exit(main())
