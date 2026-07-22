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
| `seo.spec.ts` | Title, meta description, single canonical, indexability, Open Graph and Twitter cards, JSON-LD Person/WebSite/ProfilePage graph, single h1 on home and resume, sitemap.xml URLs, robots.txt |
| `home-content.spec.ts` | Home page facts match the resume: roles and location, section anchors, education, employers and dates, project repository links, awards, certifications, RESUME nav button opening `/resume`, footer contact channels |
| `resume-page.spec.ts` | `/resume` states name, roles, and location; PDF download and contact links; every resume section; all five employment entries in order; headline quantitative achievements |
| `navigation.spec.ts` | Desktop nav anchors target existing sections, mobile hamburger menu open/navigate/close with `aria-expanded`, theme toggle, cross-page navigation |
| `links.spec.ts` | Every internal link resolves (< 400), in-page anchors point at real elements, external links are valid https URLs and `_blank` links carry `rel="noopener"` |
| `assets.spec.ts` | Resume PDF is served and is a real PDF, `llms.txt` describes the profile for AI crawlers, profile image and GitHub metrics assets, books dataset JSON |
| `books.spec.ts` | `/books` library behavior: initial load with a full first page and total count, debounced search by title or author, definitive empty state, category filter resetting to page 1, Previous/Next pagination, meaningful image alt text; dataset quality gates: every book has a title and a description or review, cover URLs are well-formed, and over 40% of books have real covers |
| `a11y.spec.ts` | axe WCAG 2 A/AA scan on every page; critical violations fail the test, serious violations are logged as warnings |
| `console-health.spec.ts` | Every page returns 200 and produces no console errors or page crashes |

`helpers.ts` defines the page list with expected canonicals and the console-error filter: identifiable third-party noise and third-party resource-load failures are ignored, while same-origin failures (except Vercel-injected `/_vercel/` analytics scripts, which 404 under local `next start`) fail the suite.

## CI

`.github/workflows/e2e.yml` runs two jobs on pull requests and pushes to `main`: a `quality` job (`npm run lint` and `npm run typecheck`) and the `e2e` job with the full suite.
The `e2e` job deletes the `public/library` and `public/content_library` symlinks before building because they point at local-only folders on the owner's machine and are broken on CI runners.
On failure it uploads the HTML report as the `playwright-report` artifact (14-day retention).
