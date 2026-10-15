// schema.org JSON-LD for search engines and AI answer engines. Every fact is
// derived from app/lib/profile.ts, the same source the pages, the resume, and
// the agent endpoints use, so search engines never see a different employer,
// title, or degree than a reader does. Conflicting facts across sources are
// what make AI assistants hedge instead of recommending someone.

import { CERTIFICATIONS, CONTACT, EDUCATION, EXPERIENCE, HEADLINE, SITE_URL, SKILLS, SUMMARY } from './profile';

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
        name: `${s.degree}, ${schoolName(s.school)}${/expected/i.test(s.dates) ? ` (in progress, ${s.dates.split(' - ')[1].toLowerCase()})` : ''}${s.gpa ? ` (${s.gpa})` : ''}`,
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
