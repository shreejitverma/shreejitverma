// The profile as a JSON Resume document (https://jsonresume.org/schema), the
// de facto machine-readable resume format read by resume tooling and
// recruiting agents. Built from the same data as /resume.

import {
  AWARDS, CERTIFICATIONS, CONTACT, EDUCATION, EXPERIENCE, HEADLINE, INTERESTS, LANGUAGES,
  PROJECTS, SITE_URL, SKILLS, SUMMARY,
} from '../profile';
import { absoluteUrl } from './knowledge';

const MONTHS: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
};

// 'Oct 2026' -> '2026-10'. Throws on anything else, so a typo in profile.ts
// fails the build instead of publishing a wrong date.
function isoMonth(text: string): string {
  const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(text.trim());
  const month = match && MONTHS[match[1].toLowerCase()];
  if (!match || !month) throw new Error(`Unparseable resume date: "${text}"`);
  return `${match[2]}-${month}`;
}

// 'Feb 2026 - May 2026' -> both ends; 'Oct 2026 - Present' and
// 'Aug 2024 - Expected Dec 2026' are ongoing, so they have no end date.
export function dateRange(dates: string | undefined): { startDate?: string; endDate?: string } {
  if (!dates) return {};
  const [start, end] = dates.split(/\s+-\s+/);
  if (end === undefined) throw new Error(`Unparseable resume date range: "${dates}"`);
  const ongoing = /^(present|expected\b)/i.test(end.trim());
  return { startDate: isoMonth(start), ...(ongoing ? {} : { endDate: isoMonth(end) }) };
}

export function buildJsonResume() {
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: HEADLINE.name,
      label: HEADLINE.roles,
      image: absoluteUrl('/Shreejit_Verma_profile_pic.jpg'),
      email: CONTACT.email,
      url: SITE_URL,
      summary: SUMMARY,
      location: { city: 'New York', region: 'NY', countryCode: 'US' },
      profiles: [
        { network: 'LinkedIn', username: 'shreejitverma', url: CONTACT.linkedin },
        { network: 'GitHub', username: 'shreejitverma', url: CONTACT.github },
        { network: 'Google Scholar', url: CONTACT.scholar },
      ],
    },
    work: EXPERIENCE.map((role) => ({
      name: role.company,
      position: role.title,
      url: role.url,
      location: role.location,
      ...dateRange(role.dates),
      ...(role.summary ? { summary: role.summary } : {}),
      highlights: role.bullets,
    })),
    education: EDUCATION.map((school) => ({
      institution: school.school,
      studyType: school.degree.split(' in ')[0],
      area: school.degree.includes(' in ') ? school.degree.slice(school.degree.indexOf(' in ') + 4) : school.degree,
      ...dateRange(school.dates),
      ...(school.gpa ? { score: school.gpa.replace(/^GPA\s+/, '') } : {}),
      courses: school.coursework.replace(/\.$/, '').split(/,\s+/),
    })),
    projects: PROJECTS.filter((p) => !p.homeOnly).map((project) => ({
      name: project.name,
      description: project.detail,
      ...dateRange(project.dates),
      keywords: project.tags,
      ...(project.context ? { entity: project.context } : {}),
      ...(project.repo || project.caseStudy ? { url: project.caseStudy ? absoluteUrl(project.caseStudy) : project.repo } : {}),
    })),
    awards: AWARDS.map((award) => ({ title: award.title, summary: award.detail })),
    certificates: [...CERTIFICATIONS.finance, ...CERTIFICATIONS.computerScience].map((cert) => ({ name: cert.name, url: cert.url })),
    skills: SKILLS.map((group) => ({ name: group.label, keywords: group.items })),
    languages: LANGUAGES.flatMap((group) => group.names.split(/,\s+/).map((language) => ({ language, fluency: group.level }))),
    interests: INTERESTS.split(/,\s+/).map((name) => ({ name })),
    meta: { canonical: absoluteUrl('/resume.json'), version: 'v1.0.0' },
  };
}
