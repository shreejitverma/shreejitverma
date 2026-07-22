import { test, expect } from '@playwright/test';

const SEARCH_PLACEHOLDER = 'Search by title or author...';
const BOOKS_PER_PAGE = 24;

test.describe('Books library functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/books');
    // Wait for the async dataset fetch to render the grid.
    await expect(page.getByText('Loading library index...')).toHaveCount(0, { timeout: 20_000 });
  });

  test('loads the library with a full first page and total count', async ({ page }) => {
    const cards = page.locator('main img[alt]');
    expect(await cards.count()).toBeGreaterThanOrEqual(BOOKS_PER_PAGE);
    await expect(page.getByText(/digital repository of \d{3,}/)).toBeVisible();
  });

  test('search narrows results to matching titles or authors', async ({ page }) => {
    const search = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await search.fill('C++');
    // The input debounces 300ms before filtering; poll until results reflect it.
    await expect
      .poll(async () => {
        const titles = await page.locator('main h3').allTextContents();
        const authors = await page.locator('main h3 + p').allTextContents();
        const rows = titles.map((t, i) => `${t} ${authors[i] ?? ''}`.toLowerCase());
        return rows.length > 0 && rows.every((row) => row.includes('c++'));
      }, { timeout: 10_000 })
      .toBe(true);
  });

  test('nonsense search shows the definitive empty state', async ({ page }) => {
    await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill('zzzz-no-such-book-9999');
    await expect(page.getByText('No books found matching your criteria.')).toBeVisible();
  });

  test('category filter switches the shelf and resets pagination', async ({ page }) => {
    await page.getByRole('button', { name: 'Computer Science & Data' }).click();
    await expect.poll(async () => page.locator('main h3').count()).toBeGreaterThan(0);
    await expect(page.getByText(/Page 1 of/)).toBeVisible();
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.getByText(/Page 1 of/)).toBeVisible();
  });

  test('pagination navigates forward and back', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Next' });
    const previous = page.getByRole('button', { name: 'Previous' });
    await expect(previous).toBeDisabled();
    await next.click();
    await expect(page.getByText(/Page 2 of/)).toBeVisible();
    await previous.click();
    await expect(page.getByText(/Page 1 of/)).toBeVisible();
    await expect(previous).toBeDisabled();
  });

  test('every rendered book card has an image with meaningful alt text', async ({ page }) => {
    const images = page.locator('main img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const alt = (await images.nth(i).getAttribute('alt')) ?? '';
      expect(alt.trim().length, `image ${i} missing alt`).toBeGreaterThan(2);
    }
  });
});

test.describe('Books dataset quality', () => {
  test('every book has a description or review and well-formed fields', async ({ request }) => {
    const response = await request.get('/books_data_validated.json');
    expect(response.status()).toBe(200);
    const books: Array<Record<string, string>> = await response.json();
    expect(books.length).toBeGreaterThan(1000);

    const missingText: string[] = [];
    const badCover: string[] = [];
    for (const book of books) {
      expect(book.title?.trim(), 'book without title').toBeTruthy();
      const text = `${book.description ?? ''}${book.review ?? ''}`.trim();
      if (text.length < 20) missingText.push(book.title);
      const cover = (book.coverImage ?? '').trim();
      if (cover && !/^(https:\/\/|\/)/.test(cover)) badCover.push(`${book.title}: ${cover}`);
    }
    expect(missingText, `books missing description/review: ${missingText.slice(0, 5).join('; ')}`).toEqual([]);
    expect(badCover, badCover.slice(0, 5).join('; ')).toEqual([]);
  });

  test('a substantial share of the library has real cover images', async ({ request }) => {
    const books: Array<Record<string, string>> = await (await request.get('/books_data_validated.json')).json();
    const withCover = books.filter((b) => (b.coverImage ?? '').trim().length > 0).length;
    const share = withCover / books.length;
    expect(share, `only ${(share * 100).toFixed(1)}% of books have covers`).toBeGreaterThan(0.4);
  });
});
