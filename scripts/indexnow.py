"""Submit every URL in the live sitemap to IndexNow.

IndexNow (https://www.indexnow.org) tells Bing, Yandex, Seznam, Naver, and
Yep that pages changed, so they recrawl in minutes instead of weeks. Bing's
index also backs ChatGPT search, Microsoft Copilot, and DuckDuckGo, so a fresh
Bing index is what AI assistants quote. The key is public by design: search
engines verify ownership by fetching https://<host>/<key>.txt.

.github/workflows/indexnow.yml runs this after each production deployment.

    python3 scripts/indexnow.py                # submit
    python3 scripts/indexnow.py --dry-run      # print the payload only
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit
from xml.etree import ElementTree

SITE = "https://www.shreejitverma.com"
KEY = "a31d850309d40502597fcc0663404e38"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
# IndexNow accepts up to 10,000 URLs per request.
MAX_URLS = 10_000


def sitemap_urls(xml_text: str, host: str) -> list[str]:
    """Return the sitemap's <loc> URLs on `host`, in order, without duplicates.

    Raises ValueError for an empty sitemap: submitting nothing would report
    success while telling search engines nothing.
    """
    root = ElementTree.fromstring(xml_text)
    seen: dict[str, None] = {}
    for loc in root.findall("sm:url/sm:loc", SITEMAP_NS):
        url = (loc.text or "").strip()
        if url and urlsplit(url).hostname == host:
            seen.setdefault(url)
    if not seen:
        raise ValueError(f"sitemap lists no URLs on {host}")
    return list(seen)[:MAX_URLS]


def payload(urls: list[str]) -> dict:
    return {"host": urlsplit(SITE).hostname, "key": KEY, "keyLocation": f"{SITE}/{KEY}.txt", "urlList": urls}


def fetch(url: str) -> str:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8")


def submit(body: dict) -> int:
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status
    except urllib.error.HTTPError as error:
        # 200 and 202 mean accepted; anything else is a real failure (bad key,
        # key file unreachable, rate limit) and must fail the workflow.
        detail = error.read().decode("utf-8", "replace")[:500]
        raise SystemExit(f"IndexNow rejected the submission: HTTP {error.code} {detail}") from error


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    key_body = fetch(f"{SITE}/{KEY}.txt").strip()
    if key_body != KEY:
        raise SystemExit(f"{SITE}/{KEY}.txt does not serve the IndexNow key; refusing to submit")

    urls = sitemap_urls(fetch(f"{SITE}/sitemap.xml"), urlsplit(SITE).hostname)
    body = payload(urls)
    if args.dry_run:
        print(json.dumps(body, indent=2))
        return 0
    status = submit(body)
    print(f"IndexNow accepted {len(urls)} URLs (HTTP {status})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
