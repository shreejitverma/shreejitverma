#!/usr/bin/env python3
"""Enrich public/books_data_validated.json with cover images and descriptions.

Sources, in order:
1. Open Library search API (cover, isbn, publisher) + work API (description)
2. Google Books volumes API (cover + description) when Open Library misses
3. A synthesized factual one-liner so no book ships with an empty description

The script is resumable: it saves progress atomically every BATCH books and
skips entries that already have both a cover image and a description.

Usage: python3 scripts/enrich_books.py [--limit N] [--data PATH]
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import sys
import tempfile
import time
import urllib.parse
import urllib.request

DATA_PATH = "public/books_data_validated.json"
BATCH = 50
DELAY_S = 0.35
MAX_DESC = 500
USER_AGENT = "shreejitverma.com book library enrichment (contact: shreejitverma@gmail.com)"


def http_json(url: str, timeout: int = 20, retries: int = 3, retry_on_429: bool = True) -> dict | None:
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.load(resp)
        except Exception as exc:  # noqa: BLE001 - treat any failure as a miss after retries
            status = getattr(exc, "code", None)
            if status == 429 and not retry_on_429:
                raise QuotaExhausted from exc
            if status == 429 or (status is not None and status >= 500):
                time.sleep(2 ** (attempt + 1))
                continue
            return None
    return None


class QuotaExhausted(Exception):
    """Raised when a provider signals a daily quota that will not recover soon."""


def clean_title(raw: str) -> str:
    title = raw.replace("_", ": ")
    title = re.sub(r"\s+", " ", title).strip(" :-")
    return title


def clean_author(raw: str) -> str:
    author = re.split(r"[,;&]| and ", raw)[0]
    return re.sub(r"\s+", " ", author).strip()


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio()


def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", " ", text)


def tidy_description(text: str) -> str:
    text = re.sub(r"\s+", " ", strip_html(text)).strip()
    if len(text) > MAX_DESC:
        cut = text[:MAX_DESC]
        cut = cut[: cut.rfind(" ")] if " " in cut else cut
        text = cut.rstrip(" ,;:") + "..."
    return text


def ol_search(params: dict) -> list:
    params = {**params, "limit": 3, "fields": "title,author_name,cover_i,isbn,publisher,key,first_publish_year"}
    url = "https://openlibrary.org/search.json?" + urllib.parse.urlencode(params)
    payload = http_json(url)
    return payload.get("docs", []) if payload else []


def shortened(title: str) -> str:
    head = re.split(r"[:!?]", title)[0].strip()
    words = head.split()
    return " ".join(words[:6]) if len(words) > 6 else head


def from_open_library(title: str, author: str, need_desc: bool = True) -> dict:
    author_known = bool(author) and "unknown" not in author.lower()
    attempts: list[dict] = []
    if author_known:
        attempts.append({"title": title, "author": author})
    attempts.append({"title": title})
    if shortened(title) != title:
        attempts.append({"title": shortened(title)})
        if author_known:
            attempts.append({"q": f"{shortened(title)} {author}"})

    docs: list = []
    for params in attempts:
        docs = ol_search(params)
        if docs:
            break
        time.sleep(DELAY_S)
    if not docs:
        return {}
    payload = {"docs": docs}
    best, best_score = None, 0.0
    for doc in payload["docs"]:
        doc_title = doc.get("title", "")
        # Dataset titles are often truncated, so also score against shortened forms.
        score = max(
            similarity(title, doc_title),
            similarity(shortened(title), shortened(doc_title)),
        )
        if author and "unknown" not in author.lower() and doc.get("author_name"):
            score += 0.15 * max(similarity(author, a) for a in doc["author_name"])
        if doc.get("cover_i"):
            score += 0.05
        if score > best_score:
            best, best_score = doc, score
    if best is None or best_score < 0.55:
        return {}
    result: dict = {}
    if best.get("cover_i"):
        result["coverImage"] = f"https://covers.openlibrary.org/b/id/{best['cover_i']}-M.jpg"
    if best.get("isbn"):
        result["isbn"] = best["isbn"][0]
    if best.get("publisher"):
        result["publisher"] = best["publisher"][0]
    if need_desc and best.get("key"):
        time.sleep(DELAY_S)
        work = http_json(f"https://openlibrary.org{best['key']}.json")
        if work:
            desc = work.get("description")
            if isinstance(desc, dict):
                desc = desc.get("value", "")
            if isinstance(desc, str) and len(desc.strip()) >= 30:
                result["description"] = tidy_description(desc)
    return result


GOOGLE_DEAD = False


def from_google_books(title: str, author: str) -> dict:
    # Daily-quota 429s do not recover within a run; short-circuit after the first.
    global GOOGLE_DEAD
    if GOOGLE_DEAD:
        return {}
    query = f'intitle:"{title}"'
    if author and author.lower() != "unknown":
        query += f' inauthor:"{author}"'
    url = "https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode(
        {"q": query, "maxResults": 3, "printType": "books"}
    )
    try:
        payload = http_json(url, retry_on_429=False)
    except QuotaExhausted:
        GOOGLE_DEAD = True
        print("  google books daily quota exhausted; disabling for this run", flush=True)
        return {}
    if not payload or not payload.get("items"):
        return {}
    best, best_score = None, 0.0
    for item in payload["items"]:
        info = item.get("volumeInfo", {})
        score = similarity(title, info.get("title", ""))
        if author and info.get("authors"):
            score += 0.15 * max(similarity(author, a) for a in info["authors"])
        if score > best_score:
            best, best_score = info, score
    if best is None or best_score < 0.55:
        return {}
    result: dict = {}
    thumb = (best.get("imageLinks") or {}).get("thumbnail")
    if thumb:
        result["coverImage"] = thumb.replace("http://", "https://")
    desc = best.get("description", "")
    if isinstance(desc, str) and len(desc.strip()) >= 30:
        result["description"] = tidy_description(desc)
    if best.get("publisher"):
        result.setdefault("publisher", best["publisher"])
    for ident in best.get("industryIdentifiers", []):
        if ident.get("type", "").startswith("ISBN"):
            result.setdefault("isbn", ident.get("identifier"))
            break
    return result


def synthesized_description(book: dict) -> str:
    title = clean_title(book.get("title", "Untitled"))
    author = clean_author(book.get("author", "")) or "an unknown author"
    category = (book.get("category") or "Reference").strip()
    year = book.get("year", "")
    year_part = f" ({year})" if year and year != "Unknown" else ""
    return (
        f"{title}{year_part} by {author}. Part of the {category} shelf in this curated "
        "quantitative finance and engineering library."
    )


def needs_enrichment(book: dict) -> bool:
    has_cover = bool((book.get("coverImage") or "").strip())
    has_desc = bool((book.get("description") or "").strip()) or bool((book.get("review") or "").strip())
    if not has_desc:
        return True
    # Retry covers only for books never looked up; a done-marker prevents
    # re-grinding permanent misses on every resumed run.
    return not has_cover and not book.get("coverLookupDone")


def save(data: list, path: str) -> None:
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path) or ".", suffix=".tmp")
    with os.fdopen(fd, "w") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    os.replace(tmp, path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="max books to enrich this run (0 = all)")
    parser.add_argument("--data", default=DATA_PATH)
    args = parser.parse_args()

    with open(args.data) as fh:
        data = json.load(fh)

    todo = [i for i, b in enumerate(data) if needs_enrichment(b)]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(data)} books total, {len(todo)} to enrich", flush=True)

    stats = {"openlibrary": 0, "google": 0, "synthesized": 0, "covers": 0}
    for done, idx in enumerate(todo, 1):
        book = data[idx]
        title = clean_title(book.get("title", ""))
        author = clean_author(book.get("author", ""))

        need_desc = not ((book.get("description") or "").strip() or (book.get("review") or "").strip())
        found = from_open_library(title, author, need_desc=need_desc)
        source = "openlibrary" if found else ""
        time.sleep(DELAY_S)
        if not found.get("coverImage") or (need_desc and not found.get("description")):
            google = from_google_books(title, author)
            if google:
                for key, value in google.items():
                    found.setdefault(key, value)
                source = source or "google"
            time.sleep(DELAY_S)

        if found.get("coverImage") and not (book.get("coverImage") or "").strip():
            book["coverImage"] = found["coverImage"]
            stats["covers"] += 1
        if found.get("description") and not (book.get("description") or "").strip():
            book["description"] = found["description"]
        for key in ("isbn", "publisher"):
            if found.get(key) and not (book.get(key) or "").strip():
                book[key] = found[key]

        if not (book.get("description") or "").strip() and not (book.get("review") or "").strip():
            book["description"] = synthesized_description(book)
            source = source or "synthesized"
        book["coverLookupDone"] = True
        stats[source or "synthesized"] = stats.get(source or "synthesized", 0) + 1

        if done % BATCH == 0:
            save(data, args.data)
            print(f"  {done}/{len(todo)} enriched ({stats})", flush=True)

    save(data, args.data)
    print(f"done: {stats}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
