// Structured, read-only views of the profile for machine clients. The MCP
// server, the A2A agent, the search API, and llms.txt all answer from these
// functions, so every agent surface returns the same facts as the HTML.

import {
  AWARDS, CERTIFICATIONS, CONTACT, EDUCATION, EXPERIENCE, HEADLINE, INTERESTS, LANGUAGES,
  PROJECTS, PROOF_METRICS, SITE_URL, SKILLS, SUMMARY,
} from '../profile';
import { ARTICLES, articleUrl } from '../writing';
import { SITE_PAGES, markdownPath } from './pages';

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path === '/' ? '' : path}`);

export function getProfile() {
  return {
    name: HEADLINE.name,
    roles: HEADLINE.roles.split(' | '),
    current: HEADLINE.current,
    location: HEADLINE.location,
    summary: SUMMARY,
    highlights: PROOF_METRICS.map((m) => `${m.value} ${m.label} (${m.context})`),
    contact: {
      email: CONTACT.email,
      bookACall: CONTACT.calendly,
      linkedin: CONTACT.linkedin,
      github: CONTACT.github,
      scholar: CONTACT.scholar,
    },
    links: {
      website: SITE_URL,
      resume: absoluteUrl('/resume'),
      resumePdf: absoluteUrl(CONTACT.resumePdf),
      resumeJson: absoluteUrl('/resume.json'),
    },
  };
}

export function getExperience(company?: string) {
  const needle = company?.trim().toLowerCase();
  return EXPERIENCE.filter((role) => !needle || role.company.toLowerCase().includes(needle));
}

export function getProjects(kind?: 'research' | 'project', tag?: string) {
  const needle = tag?.trim().toLowerCase();
  return PROJECTS
    .filter((p) => !kind || p.kind === kind)
    .filter((p) => !needle || p.tags.some((t) => t.toLowerCase().includes(needle)))
    .map(({ name, kind, context, dates, detail, tags, repo, caseStudy }) => ({
      name, kind, context, dates, detail, tags, repo, caseStudy: caseStudy && absoluteUrl(caseStudy),
    }));
}

export function getEducation() {
  return EDUCATION;
}

export function getSkills() {
  return { skills: SKILLS, languages: LANGUAGES, certifications: CERTIFICATIONS, awards: AWARDS, interests: INTERESTS };
}

export function listPages() {
  return SITE_PAGES.map((page) => ({
    title: page.title,
    summary: page.summary,
    url: absoluteUrl(page.path),
    markdown: absoluteUrl(markdownPath(page.path)),
  }));
}

// ---------------------------------------------------------------------------
// Search. A small lexical ranker over the profile: each document is one fact
// source (a role, a project, a degree, a page) split into lines, scored by
// IDF-weighted term matches with a boost for title hits. The corpus is a few
// dozen documents, so a linear scan per query is cheap.

interface SearchDoc {
  kind: 'experience' | 'project' | 'education' | 'skills' | 'article' | 'page' | 'award' | 'certification';
  title: string;
  lines: string[];
  url: string;
}

export interface SearchHit {
  kind: SearchDoc['kind'];
  title: string;
  snippet: string;
  url: string;
  score: number;
}

const TOKEN = /[a-z0-9][a-z0-9+#.\-/]*/g;

// Question words and filler that agents put in natural-language queries
// ("What did he build with FPGAs?"). They carry no signal here and would
// otherwise match titles such as "What a Market Risk Capital Engine Computes".
const STOPWORDS = new Set([
  'a', 'about', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'can', 'did', 'do', 'does', 'for', 'from',
  'has', 'have', 'he', 'him', 'his', 'how', 'in', 'is', 'it', 'me', 'of', 'on', 'or', 'tell', 'that', 'the',
  'this', 'to', 'was', 'what', 'when', 'where', 'which', 'who', 'with', 'worked', 'work', 'experience',
  'shreejit', 'verma', 'you', 'your',
]);

// Folds a plain English plural ("FPGAs" -> "fpga", "systems" -> "system"),
// applied to query and documents alike. Short tokens and "-ss" words stay.
function stem(token: string): string {
  return token.length > 3 && token.endsWith('s') && !token.endsWith('ss') ? token.slice(0, -1) : token;
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN) ?? [])
    .map((t) => stem(t.replace(/[.\-/]+$/, '')))
    .filter((t) => t.length > 1 || t === 'c' || t === 'r');
}

const MAX_QUERY_CHARS = 200;
const MAX_QUERY_TERMS = 32;

function queryTerms(query: string): string[] {
  return [...new Set(tokenize(query.slice(0, MAX_QUERY_CHARS)).filter((t) => !STOPWORDS.has(t)))].slice(0, MAX_QUERY_TERMS);
}

function buildCorpus(): SearchDoc[] {
  return [
    ...EXPERIENCE.map((role) => ({
      kind: 'experience' as const,
      title: `${role.title}, ${role.company}`,
      lines: [`${role.company}, ${role.location}, ${role.dates}`, ...(role.summary ? [role.summary] : []), ...role.bullets],
      url: absoluteUrl('/#experience'),
    })),
    ...PROJECTS.map((project) => ({
      kind: 'project' as const,
      title: project.name,
      lines: [project.detail, [project.context, project.dates].filter(Boolean).join(', '), `Tags: ${project.tags.join(', ')}`],
      url: project.caseStudy ? absoluteUrl(project.caseStudy) : project.repo ?? absoluteUrl(project.kind === 'research' ? '/#research' : '/#projects'),
    })),
    ...EDUCATION.map((school) => ({
      kind: 'education' as const,
      title: `${school.degree}, ${school.school}`,
      lines: [[school.dates, school.gpa].filter(Boolean).join(', '), `Coursework: ${school.coursework}`],
      url: absoluteUrl('/#education'),
    })),
    ...SKILLS.map((group) => ({
      kind: 'skills' as const,
      title: `Skills: ${group.label}`,
      lines: [group.items.join(', ')],
      url: absoluteUrl('/#skills'),
    })),
    ...AWARDS.map((award) => ({
      kind: 'award' as const,
      title: award.title,
      lines: [award.detail],
      url: absoluteUrl('/#awards'),
    })),
    ...[...CERTIFICATIONS.finance, ...CERTIFICATIONS.computerScience].map((cert) => ({
      kind: 'certification' as const,
      title: cert.name,
      lines: [`Certification: ${cert.name}`],
      url: cert.url,
    })),
    ...ARTICLES.map((article) => ({
      kind: 'article' as const,
      title: article.title,
      lines: [article.description, `Tags: ${article.tags.join(', ')}`, `Published ${article.published}`],
      url: absoluteUrl(articleUrl(article.slug)),
    })),
    ...SITE_PAGES.filter((page) => !page.published).map((page) => ({
      kind: 'page' as const,
      title: page.title,
      lines: [page.summary],
      url: absoluteUrl(page.path),
    })),
  ];
}

const CORPUS = buildCorpus();
const DOC_TOKENS = CORPUS.map((doc) => [...new Set(tokenize([doc.title, ...doc.lines].join(' ')))]);
const IDF = (() => {
  const df = new Map<string, number>();
  for (const tokens of DOC_TOKENS) for (const t of tokens) df.set(t, (df.get(t) ?? 0) + 1);
  return (term: string) => Math.log(1 + CORPUS.length / (df.get(term) ?? 0.5));
})();

function termMatches(token: string, term: string): boolean {
  return token === term || (term.length >= 4 && token.startsWith(term));
}

export function searchProfile(query: string, limit = 5): SearchHit[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const hits: SearchHit[] = [];
  CORPUS.forEach((doc, i) => {
    const titleTokens = tokenize(doc.title);
    let score = 0;
    for (const term of terms) {
      const inDoc = DOC_TOKENS[i].some((t) => termMatches(t, term));
      if (!inDoc) continue;
      score += IDF(term) * (titleTokens.some((t) => termMatches(t, term)) ? 2 : 1);
    }
    if (score === 0) return;
    const snippet = doc.lines
      .map((line) => {
        const lineTokens = tokenize(line);
        return { line, n: terms.filter((term) => lineTokens.some((t) => termMatches(t, term))).length };
      })
      .sort((a, b) => b.n - a.n)[0].line;
    hits.push({ kind: doc.kind, title: doc.title, snippet, url: doc.url, score: Math.round(score * 100) / 100 });
  });
  return hits.sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.min(limit, 20)));
}
