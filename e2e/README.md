# End-to-End Test Suite

Playwright suite that exercises every public surface of the website.
`playwright.config.ts` builds and serves a production build (`npm run build && npm run start`) on `http://localhost:3000` automatically before the tests run.

## Running locally

```bash
npx playwright install chromium   # one-time browser install
npm run test:e2e                  # full suite
npm run test:e2e:ui               # interactive UI mode
```

Every spec runs on two device profiles: `desktop` (Desktop Chrome) and `mobile` (Pixel 7).
Pixel 7 is a Chromium device profile, chosen so CI only needs the chromium browser.
Test artifacts (`test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`) are gitignored.

## Coverage

| Spec | What it checks |
| --- | --- |
| `seo.spec.ts` | Title, meta description, single canonical, indexability, page-specific Open Graph and Twitter cards (`og:url` equals the canonical, `twitter:title` matches `og:title`), the generated 1200x630 `/opengraph-image` card, no target-employer keyword stuffing, site icons under 100 KB, JSON-LD Person/WebSite/ProfilePage graph and article `TechArticle` data, single h1 on every page except `/books` and `/value-investing`, every page's `<h1>` present in the server-rendered HTML, sitemap.xml URLs, robots.txt |
| `home-content.spec.ts` | Home page facts match the resume: roles and location, every section anchor, hero proof metrics and contact actions, research and project cards never linking to a placeholder `#` and featuring `/work/trishul`, research theses and the Value Intelligence Platform, every key project from the previous site, every technical arsenal skill family, engineering philosophy principles tied to real work with no unsourced percentages, link to the latest writing, education, employers and dates, repository links, awards with interests and every language level, certifications with credential links, the reading list preview with 12 loaded covers and the dataset's book count, every GitHub metrics card URL on the output branch in the server-rendered markup, RESUME nav button opening `/resume`, footer contact channels |
| `resume-page.spec.ts` | `/resume` states name, roles, and location; PDF download and contact links; every resume section; all six employment entries in order (current Barclays role first); linked finance and CS certifications; headline quantitative achievements |
| `navigation.spec.ts` | Desktop nav anchors target existing sections, mobile hamburger menu open/navigate/close with `aria-expanded`, theme toggle, `dark:` utilities following the site theme rather than the OS color scheme, desktop nav links to `/value-investing` and `/books`, cross-page navigation |
| `github-stats.spec.ts` | `parseGitHubStats` accepts the shape `scripts/github_stats.py` writes, drops unknown fields, and rejects missing, negative, fractional, or non-numeric counts, an unparseable timestamp, and non-objects |
| `links.spec.ts` | Every internal link resolves (< 400), in-page anchors point at real elements, external links are valid https URLs and `_blank` links carry `rel="noopener"` |
| `assets.spec.ts` | Resume PDF is served and is a real PDF, the IndexNow key file is served with the key as its exact body (so Bing and Yandex can verify ownership), `llms.txt` describes the profile for AI crawlers, profile images, books dataset JSON |
| `books.spec.ts` | `/books` library behavior: initial load with a full first page and total count, debounced search by title or author, definitive empty state, category filter resetting to page 1, data-driven category pills whose counts match the dataset, numbered pagination (Previous/Next plus a direct jump to the last page), every card offering a `Find on Amazon` link and none linking into the unserved `/library/` or `/content_library/` paths, page changes scrolling back to the top of the results, content painting above the fixed background canvas, meaningful image alt text; dataset quality gates: every book has a title and a description or review, cover URLs are well-formed, every self-hosted `/covers/` image the dataset references (imported from the Obsidian vault) is served as WebP, the shelves are exactly the expected ten categories with General kept under 150 books, and over 40% of books have real covers |
| `value-investing.spec.ts` | Scoring engine golden values, tie-aware percentile ranks, signal thresholds and signal/score agreement, dataset domain invariants, CSV structure with currency; page render, sort order and `aria-sort`, CSV download, Graham Number currency labels, methodology disclosures, and an honesty gate against fake live-data indicators |
| `a11y.spec.ts` | axe WCAG 2 A/AA scan on every page in both the dark and light site themes; serious and critical violations fail the test |
| `console-health.spec.ts` | Every page returns 200 and produces no console errors or page crashes |

`helpers.ts` defines the page list with expected canonicals and the console-error filter: identifiable third-party noise and third-party resource-load failures are ignored, while same-origin failures (except Vercel-injected `/_vercel/` analytics scripts, which 404 under local `next start`) fail the suite.

## CI

`.github/workflows/e2e.yml` runs two jobs on pull requests and pushes to `main`: a `quality` job (`npm run lint` and `npm run typecheck`) and the `e2e` job with the full suite.
On failure it uploads the HTML report as the `playwright-report` artifact (14-day retention).
