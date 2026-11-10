// schema.org JSON-LD for search engines and AI answer engines. Every fact is
// derived from app/lib/profile.ts, the same source the pages, the resume, and
// the agent endpoints use, so search engines never see a different employer,
// title, or degree than a reader does. Conflicting facts across sources are
// what make AI assistants hedge instead of recommending someone.

import { CERTIFICATIONS, CONTACT, EDUCATION, EXPERIENCE, HEADLINE, SITE_URL, SKILLS, SUMMARY } from './profile';
import { KNOWLEDGE_BASES, OPEN_SOURCE_PATH, kbPath, repoUrl, type KnowledgeBase } from './open-source';

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// Topics the person is an authority on, for Person.knowsAbout. Curated for
// how recruiters and assistants phrase quant searches; each is backed by a
// role, project, or skill on the site.
const KNOWS_ABOUT = [
  'Quantitative Finance', 'Quantitative Development', 'Quantitative Research', 'High Frequency Trading',
  'Automated Market Making', 'Market Microstructure', 'FRTB', 'Basel IV Market Risk', 'Expected Shortfall',
  'Low Latency C++', 'FPGA Market Data Handlers', 'Kernel Bypass (DPDK)', 'Limit Order Books',
  'Lock-Free Data Structures', 'Statistical Arbitrage', 'Merger Arbitrage', 'Execution Algorithms',
  'Stochastic Calculus', 'Derivatives Pricing', 'Portfolio Optimization', 'Risk Management',
  'Time Series Analysis', 'Machine Learning', 'Python', 'KDB+/q',
  'Agentic AI', 'Multi-Agent Systems', 'Model Context Protocol', 'System Design', 'Distributed Systems',
  'Quantitative Finance Interview Preparation',
];

const schoolName = (school: string) => school.replace(/\s*\(Online\)$/, '').replace(/,\s*Tepper School of Business$/, '');
const completedOrCurrent = EDUCATION.filter((s) => !/withdrawn/i.test(s.degree));
const current = EXPERIENCE.find((role) => role.current) ?? EXPERIENCE[0];

// Plain title without the engagement and team qualifiers:
// 'Senior Quantitative Developer (Contract), FRTB Market Risk' -> 'Senior Quantitative Developer'.
const currentTitle = current.title.split(/\s*[(,]/)[0];

export function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: HEADLINE.name,
    url: SITE_URL,
    image: `${SITE_URL}/Shreejit_Verma_profile_pic.jpg`,
    email: `mailto:${CONTACT.email}`,
    jobTitle: [currentTitle, ...HEADLINE.roles.split(' | ').filter((r) => r !== currentTitle)],
    description: SUMMARY,
    address: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
    nationality: { '@type': 'Country', name: 'India' },
    worksFor: { '@type': 'Organization', name: current.company, url: current.url },
    hasOccupation: {
      '@type': 'Occupation',
      name: currentTitle,
      occupationLocation: { '@type': 'City', name: 'New York' },
      skills: SKILLS.flatMap((group) => group.items).join(', '),
    },
    alumniOf: [...new Set(EDUCATION.map((s) => schoolName(s.school)))].map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    hasCredential: [
      ...completedOrCurrent.map((s) => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: `${s.degree}, ${schoolName(s.school)}${/expected/i.test(s.dates) ? ` (in progress, ${s.dates.split(' - ')[1].replace(/^Expected/, 'expected')})` : ''}${s.gpa ? ` (${s.gpa})` : ''}`,
      })),
      ...CERTIFICATIONS.finance.filter((c) => c.name === 'CFA Level 1').map((c) => ({
        '@type': 'EducationalOccupationalCredential', credentialCategory: 'certification', name: c.name, url: c.url,
      })),
    ],
    knowsAbout: KNOWS_ABOUT,
    sameAs: [CONTACT.linkedin, CONTACT.github, CONTACT.scholar, 'https://x.com/shreejitverma'],
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: `${HEADLINE.name} | Quantitative Developer & Quantitative Researcher`,
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
}

// Site-wide graph: who the site is about and the site itself.
export function siteGraph() {
  return { '@context': 'https://schema.org', '@graph': [personNode(), websiteNode()] };
}

// Google's ProfilePage markup belongs only on pages that are about the person
// (home and resume), not on articles or tools.
export function profilePageGraph(path: string, name: string) {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#profilepage`,
    url,
    name,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
}

// The open-source knowledge bases as schema.org source code that is also a
// learning resource, authored by the site's Person, so search engines and
// assistants attribute the repositories to the same entity as the resume.
const kbId = (kb: KnowledgeBase) => `${SITE_URL}${kbPath(kb)}#source`;

export function knowledgeBaseNode(kb: KnowledgeBase) {
  return {
    '@type': ['SoftwareSourceCode', 'LearningResource'],
    '@id': kbId(kb),
    name: kb.name,
    description: `${kb.tagline} ${kb.summary}`,
    url: `${SITE_URL}${kbPath(kb)}`,
    codeRepository: repoUrl(kb),
    sameAs: repoUrl(kb),
    programmingLanguage: kb.languages,
    license: 'https://opensource.org/licenses/MIT',
    isAccessibleForFree: true,
    dateCreated: String(kb.since),
    inLanguage: 'en',
    learningResourceType: ['Curriculum', 'Study guide', 'Reference', 'Source code'],
    educationalLevel: 'Intermediate to advanced',
    audience: kb.audience.map((audienceType) => ({ '@type': 'Audience', audienceType })),
    teaches: kb.topics,
    keywords: kb.topics.join(', '),
    author: { '@id': PERSON_ID },
    creator: { '@id': PERSON_ID },
    maintainer: { '@id': PERSON_ID },
  };
}

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '' : item.path}`,
    })),
  };
}

// /open-source: a collection page whose parts are the knowledge bases.
export function openSourceGraph(name: string, description: string) {
  const url = `${SITE_URL}${OPEN_SOURCE_PATH}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name,
        description,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': PERSON_ID },
        author: { '@id': PERSON_ID },
        hasPart: KNOWLEDGE_BASES.map((kb) => ({ '@id': kbId(kb) })),
        inLanguage: 'en-US',
      },
      ...KNOWLEDGE_BASES.map(knowledgeBaseNode),
      breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Open Source', path: OPEN_SOURCE_PATH }]),
    ],
  };
}

// /open-source/<slug>: one knowledge base and where it sits on the site.
export function knowledgeBaseGraph(kb: KnowledgeBase) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      knowledgeBaseNode(kb),
      breadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Open Source', path: OPEN_SOURCE_PATH },
        { name: kb.name, path: kbPath(kb) },
      ]),
    ],
  };
}
