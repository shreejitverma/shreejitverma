import { test, expect } from '@playwright/test';
import { parseGitHubStats } from '../app/lib/github';

// Shape written by scripts/github_stats.py; values are the real profile
// numbers from the GitHub GraphQL API on 2026-10-09.
const VALID = {
  generatedAt: '2026-10-09T15:54:45+00:00',
  memberSince: 2017,
  lastYear: { contributions: 2718, commits: 1651, pullRequests: 108, reviews: 0, issues: 6, restrictedContributions: 897 },
  streak: { current: 4, longest: 9 },
  pullRequests: { merged: 188, open: 1, closed: 5 },
  repositories: { public: 66, stars: 189, forks: 89 },
  followers: 86,
};

test.describe('GitHub stats parsing', () => {
  test('accepts the published shape unchanged', () => {
    expect(parseGitHubStats(VALID)).toEqual(VALID);
  });

  test('drops unknown fields', () => {
    expect(parseGitHubStats({ ...VALID, extra: 'ignored', lastYear: { ...VALID.lastYear, extra: 1 } })).toEqual(VALID);
  });

  test('rejects missing, negative, fractional, or non-numeric counts', () => {
    const { streak: _streak, ...missingStreak } = VALID;
    void _streak;
    for (const bad of [
      missingStreak,
      { ...VALID, followers: -1 },
      { ...VALID, repositories: { ...VALID.repositories, stars: 1.5 } },
      { ...VALID, pullRequests: { ...VALID.pullRequests, merged: '188' } },
      { ...VALID, lastYear: null },
    ]) {
      expect(parseGitHubStats(bad)).toBeNull();
    }
  });

  test('rejects an unparseable timestamp and non-objects', () => {
    expect(parseGitHubStats({ ...VALID, generatedAt: 'yesterday' })).toBeNull();
    expect(parseGitHubStats(null)).toBeNull();
    expect(parseGitHubStats('{}')).toBeNull();
  });
});
