// GitHub activity shown in the home page "GitHub Impact" section and in
// README.md. Both are rendered by .github/workflows/metrics.yml and published
// to the `output` branch: SVG cards from lowlighter/metrics, the 3D calendar,
// the snake, and the streak card, plus github-stats.json written by
// scripts/github_stats.py.

export const GITHUB_LOGIN = 'shreejitverma';

const OUTPUT_BASE = `https://raw.githubusercontent.com/${GITHUB_LOGIN}/${GITHUB_LOGIN}/output`;

export function outputUrl(file: string): string {
  return `${OUTPUT_BASE}/${file}`;
}

export interface GitHubStats {
  generatedAt: string;
  memberSince: number;
  lastYear: {
    contributions: number;
    commits: number;
    pullRequests: number;
    reviews: number;
    issues: number;
    // GitHub's restrictedContributionsCount: contributions the API token cannot
    // access, already included in `contributions`.
    restrictedContributions: number;
  };
  streak: { current: number; longest: number };
  pullRequests: { merged: number; open: number; closed: number };
  repositories: { public: number; stars: number; forks: number };
  followers: number;
}

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

function counts<K extends string>(value: unknown, keys: readonly K[]): Record<K, number> | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const out = {} as Record<K, number>;
  for (const key of keys) {
    if (!isCount(record[key])) return null;
    out[key] = record[key];
  }
  return out;
}

// Validates the published JSON, so a malformed or partial file renders the
// section without stat tiles instead of showing wrong numbers.
export function parseGitHubStats(raw: unknown): GitHubStats | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Record<string, unknown>;
  if (typeof data.generatedAt !== 'string' || Number.isNaN(Date.parse(data.generatedAt))) return null;
  if (!isCount(data.memberSince) || !isCount(data.followers)) return null;

  const lastYear = counts(data.lastYear, ['contributions', 'commits', 'pullRequests', 'reviews', 'issues', 'restrictedContributions'] as const);
  const streak = counts(data.streak, ['current', 'longest'] as const);
  const pullRequests = counts(data.pullRequests, ['merged', 'open', 'closed'] as const);
  const repositories = counts(data.repositories, ['public', 'stars', 'forks'] as const);
  if (!lastYear || !streak || !pullRequests || !repositories) return null;

  return {
    generatedAt: data.generatedAt,
    memberSince: data.memberSince,
    lastYear,
    streak,
    pullRequests,
    repositories,
    followers: data.followers,
  };
}

// Refreshed at most every six hours; the workflow publishes once a day.
const REVALIDATE_SECONDS = 6 * 60 * 60;

export async function getGitHubStats(): Promise<GitHubStats | null> {
  const url = outputUrl('github-stats.json');
  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) {
      console.warn(`GitHub stats unavailable: ${url} returned ${response.status}`);
      return null;
    }
    const stats = parseGitHubStats(await response.json());
    if (!stats) console.warn(`GitHub stats rejected: ${url} failed validation`);
    return stats;
  } catch (error) {
    console.warn(`GitHub stats unavailable: ${url}`, error);
    return null;
  }
}

// Visual cards published by the workflow; `dark` is used under the dark theme.
export interface MetricCardSpec {
  // Short name used when the card cannot load.
  label: string;
  alt: string;
  light: string;
  dark?: string;
}

export const METRIC_CARDS = {
  contrib3d: {
    label: '3D contribution calendar',
    alt: '3D contribution calendar for the last year',
    light: outputUrl('contrib3d.green-animate.svg'),
    dark: outputUrl('contrib3d.night-green.svg'),
  },
  overview: {
    label: 'GitHub overview',
    alt: 'GitHub overview: activity, repositories, and lines of code changed',
    light: outputUrl('metrics.overview.svg'),
  },
  languages: {
    label: 'Languages',
    alt: 'Most used and recently used programming languages',
    light: outputUrl('metrics.languages.svg'),
  },
  calendar: {
    label: 'Contribution calendar',
    alt: 'Contribution calendar and pull request status',
    light: outputUrl('metrics.calendar.svg'),
  },
  habits: {
    label: 'Coding habits',
    alt: 'Coding habits: commits by hour and day',
    light: outputUrl('metrics.habits.svg'),
  },
  achievements: {
    label: 'Achievements',
    alt: 'GitHub achievements',
    light: outputUrl('metrics.achievements.svg'),
  },
  repositories: {
    label: 'Featured repositories',
    alt: 'Featured repositories',
    light: outputUrl('metrics.repositories.svg'),
  },
  streak: {
    label: 'Contribution streak',
    alt: 'Contribution streak: total contributions, current streak, and longest streak',
    light: outputUrl('streak.light.svg'),
    dark: outputUrl('streak.dark.svg'),
  },
  snake: {
    label: 'Contribution snake',
    alt: 'Animated snake eating the contribution graph',
    light: outputUrl('snake.light.svg'),
    dark: outputUrl('snake.dark.svg'),
  },
} satisfies Record<string, MetricCardSpec>;
