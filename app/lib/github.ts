// GitHub activity shown in the home page "GitHub Impact" section and in
// README.md. .github/workflows/metrics.yml publishes it to the `output`
// branch: github-stats.json from scripts/github_stats.py (rendered natively
// here, and as SVG cards for the README by scripts/github_cards.py), plus the
// contribution calendar, 3D calendar, snake, and streak cards.

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
    repositoriesContributedTo: number;
    // GitHub's restrictedContributionsCount: contributions the API token cannot
    // access, already included in `contributions`.
    restrictedContributions: number;
  };
  streak: { current: number; longest: number };
  pullRequests: { merged: number; open: number; closed: number };
  repositories: { public: number; stars: number; forks: number };
  followers: number;
  // Share of last-year commits per programming language, largest first.
  languages: LanguageShare[];
}

export interface LanguageShare {
  name: string;
  color: string | null;
  share: number;
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

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function languageShares(value: unknown): LanguageShare[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const shares: LanguageShare[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) return null;
    const { name, color, share } = item as Record<string, unknown>;
    if (typeof name !== 'string' || !name.trim()) return null;
    if (color !== null && !(typeof color === 'string' && HEX_COLOR.test(color))) return null;
    if (typeof share !== 'number' || !(share >= 0 && share <= 1)) return null;
    shares.push({ name, color, share });
  }
  const total = shares.reduce((sum, item) => sum + item.share, 0);
  // Shares are rounded to four decimals, so allow a small tolerance.
  return Math.abs(total - 1) <= 0.01 ? shares : null;
}

// Validates the published JSON, so a malformed or partial file renders the
// section without stat tiles instead of showing wrong numbers.
export function parseGitHubStats(raw: unknown): GitHubStats | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Record<string, unknown>;
  if (typeof data.generatedAt !== 'string' || Number.isNaN(Date.parse(data.generatedAt))) return null;
  if (!isCount(data.memberSince) || !isCount(data.followers)) return null;

  const lastYear = counts(data.lastYear, ['contributions', 'commits', 'pullRequests', 'reviews', 'issues', 'repositoriesContributedTo', 'restrictedContributions'] as const);
  const streak = counts(data.streak, ['current', 'longest'] as const);
  const pullRequests = counts(data.pullRequests, ['merged', 'open', 'closed'] as const);
  const repositories = counts(data.repositories, ['public', 'stars', 'forks'] as const);
  const languages = languageShares(data.languages);
  if (!lastYear || !streak || !pullRequests || !repositories || !languages) return null;

  return {
    generatedAt: data.generatedAt,
    memberSince: data.memberSince,
    lastYear,
    streak,
    pullRequests,
    repositories,
    followers: data.followers,
    languages,
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
  calendar: {
    label: 'Contribution calendar',
    alt: 'Contribution calendar, commit streaks, and pull request status',
    light: outputUrl('metrics.calendar.svg'),
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
