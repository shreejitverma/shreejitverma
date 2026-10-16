"""Unit tests for scripts/indexnow.py.

python3 -m unittest discover -s scripts/tests
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import indexnow
from indexnow import KEY, USER_AGENT, payload, sitemap_urls

# Shape from the Sitemaps protocol (https://www.sitemaps.org/protocol.html),
# the format Next.js emits for app/sitemap.ts.
SITEMAP = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.shreejitverma.com</loc><priority>1</priority></url>
  <url><loc> https://www.shreejitverma.com/resume </loc></url>
  <url><loc>https://www.shreejitverma.com/resume</loc></url>
  <url><loc>https://elsewhere.example/page</loc></url>
</urlset>"""


class SitemapUrlsTest(unittest.TestCase):
    def test_keeps_order_trims_and_deduplicates(self):
        self.assertEqual(
            sitemap_urls(SITEMAP, "www.shreejitverma.com"),
            ["https://www.shreejitverma.com", "https://www.shreejitverma.com/resume"],
        )

    def test_drops_other_hosts(self):
        # IndexNow rejects a batch containing URLs outside the declared host.
        self.assertNotIn("https://elsewhere.example/page", sitemap_urls(SITEMAP, "www.shreejitverma.com"))

    def test_empty_sitemap_is_an_error_not_a_silent_success(self):
        empty = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
        with self.assertRaises(ValueError):
            sitemap_urls(empty, "www.shreejitverma.com")

    def test_sitemap_without_namespace_is_rejected(self):
        # A loc outside the sitemap namespace is not a sitemap entry.
        with self.assertRaises(ValueError):
            sitemap_urls("<urlset><url><loc>https://www.shreejitverma.com</loc></url></urlset>", "www.shreejitverma.com")


class PayloadTest(unittest.TestCase):
    def test_matches_the_indexnow_json_schema(self):
        # Field names and keyLocation rule from https://www.indexnow.org/documentation.
        body = payload(["https://www.shreejitverma.com/resume"])
        self.assertEqual(
            body,
            {
                "host": "www.shreejitverma.com",
                "key": KEY,
                "keyLocation": f"https://www.shreejitverma.com/{KEY}.txt",
                "urlList": ["https://www.shreejitverma.com/resume"],
            },
        )


class UserAgentTest(unittest.TestCase):
    # Cloudflare in front of the site blocks Python's default "Python-urllib"
    # agent (HTTP 403), so every request must carry the job's own agent.
    def test_fetch_and_submit_send_the_job_user_agent(self):
        sent = []

        class Response:
            status = 200

            def read(self):
                return b"ok"

            def __enter__(self):
                return self

            def __exit__(self, *exc):
                return False

        def fake_urlopen(request, timeout):
            sent.append(request.get_header("User-agent"))
            return Response()

        original = indexnow.urllib.request.urlopen
        indexnow.urllib.request.urlopen = fake_urlopen
        try:
            indexnow.fetch("https://www.shreejitverma.com/sitemap.xml")
            indexnow.submit(payload(["https://www.shreejitverma.com"]))
        finally:
            indexnow.urllib.request.urlopen = original
        self.assertEqual(sent, [USER_AGENT, USER_AGENT])
        self.assertNotIn("Python-urllib", USER_AGENT)


if __name__ == "__main__":
    unittest.main()
