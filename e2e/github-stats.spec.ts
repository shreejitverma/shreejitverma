import { test, expect } from '@playwright/test';
import { parseGitHubStats } from '../app/lib/github';

// Shape written by scripts/github_stats.py; values are the real profile
// numbers from the GitHub GraphQL API on 2026-10-09.
const VALID = {
  generatedAt: '2026-10-09T15:54:45+00:00',
  memberSince: 2017,
  lastYear: { contributions: 2718, commits: 1651, pullRequests: 108, reviews: 0, issues: 6, repositoriesContributedTo: 24, restrictedContributions: 897 },
  streak: { current: 4, longest: 9 },
  pullRequests: { merged: 188, open: 1, closed: 5 },
  repositories: { public: 66, stars: 189, forks: 89 },
  followers: 86,
  languages: [
    { name: 'Python', color: '#3572A5', share: 0.63 },
    { name: 'C++', color: '#f34b7d', share: 0.174 },
    { name: 'TypeScript', color: '#3178c6', share: 0.081 },
    { name: 'JavaScript', color: '#f1e05a', share: 0.049 },
    { name: 'Shell', color: '#89e051', share: 0.026 },
    { name: 'Java', color: '#b07219', share: 0.015 },
    { name: 'C', color: '#555555', share: 0.006 },
    { name: 'Verilog', color: '#b2b7f8', share: 0.005 },
    { name: 'Other', color: null, share: 0.014 },
  ],
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

  test('rejects malformed language shares', () => {
    const [first, ...rest] = VALID.languages;
    for (const languages of [
      [],
      'Python',
      [{ ...first, color: 'blue' }, ...rest],
      [{ ...first, name: ' ' }, ...rest],
      [{ ...first, share: 1.2 }, ...rest],
      // Shares must account for all commits (sum to 1 within rounding).
      rest,
    ]) {
      expect(parseGitHubStats({ ...VALID, languages }), JSON.stringify(languages).slice(0, 60)).toBeNull();
    }
  });

  test('rejects an unparseable timestamp and non-objects', () => {
    expect(parseGitHubStats({ ...VALID, generatedAt: 'yesterday' })).toBeNull();
    expect(parseGitHubStats(null)).toBeNull();
    expect(parseGitHubStats('{}')).toBeNull();
  });
});
