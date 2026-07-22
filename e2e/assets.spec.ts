import { test, expect } from '@playwright/test';

test.describe('Public assets', () => {
  test('resume PDF is served and is a real PDF', async ({ request }) => {
    const response = await request.get('/Shreejit_Verma_Resume.pdf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
    const body = await response.body();
    expect(body.length).toBeGreaterThan(100_000);
    expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  });

  test('IndexNow key file is served with the key as its exact body', async ({ request }) => {
    const key = 'a31d850309d40502597fcc0663404e38';
    const response = await request.get(`/${key}.txt`);
    expect(response.status()).toBe(200);
    // Per the IndexNow protocol the body must be exactly the key, so Bing
    // and Yandex can verify ownership when pinged with this key.
    expect(await response.text()).toBe(key);
  });

  test('llms.txt describes the profile for AI crawlers', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('Shreejit Verma');
    expect(text).toContain('Quantitative Developer');
    expect(text).toContain('/resume');
  });

  test('profile image and GitHub metrics are served', async ({ request }) => {
    for (const asset of [
      '/Shreejit_Verma_profile_pic.jpg',
      '/images/user-profile.png',
      '/metrics/metrics.main.svg',
      '/metrics/metrics.advanced.svg',
    ]) {
      const response = await request.get(asset);
      expect(response.status(), asset).toBe(200);
    }
  });

  test('books dataset loads and is non-empty', async ({ request }) => {
    const response = await request.get('/books_data_validated.json');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('title');
  });
});
