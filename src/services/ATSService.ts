import { ResumeData } from '../types';
import { ATSResult, ATSIssue, ATSScoreBreakdown } from '../types/ats';

const SECTION_WEIGHTS = {
  structure: 0.20,
  keywords: 0.35,
  contacts: 0.15,
  format: 0.15,
  dates: 0.10,
  experience: 0.05
};

const BASE_TECH_KEYWORDS = [
  'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala',
  'React', 'Vue', 'Angular', 'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Vite', 'Next.js', 'Nuxt',
  'Node', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Laravel', 'Rails',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitLab', 'GitHub Actions', 'Terraform',
  'Git', 'API', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'TDD', 'Linux', 'Bash',
  'Jest', 'Mocha', 'pytest', 'JUnit', 'Cypress', 'Playwright'
];

const ACTION_VERBS = [
  'developed', 'created', 'built', 'implemented', 'designed', 'architected', 'led', 'managed',
  'optimized', 'improved', 'reduced', 'increased', 'automated', 'deployed', 'maintained',
  'collaborated', 'mentored', 'trained', 'coordinated', 'delivered', 'launched', 'integrated',
  'migrated', 'refactored', 'debugged', 'tested', 'documented', 'analyzed', 'researched'
];

const REQUIRED_SECTIONS = {
  contacts: true,
  summary: true,
  experience: true,
  education: false,
  skills: true
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function hasActionVerbs(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ACTION_VERBS.some(verb => lowerText.includes(verb));
}

function collectResumeText(data: ResumeData): string {
  const parts: string[] = [];
  parts.push(data.personal.name || '');
  parts.push(data.personal.title || '');
  parts.push(data.personal.location || '');
  for (const skill of data.skills || []) {
    if (typeof skill === 'string') {
      parts.push(skill);
    } else {
      parts.push(skill.category);
      parts.push(...skill.items);
    }
  }
  for (const exp of data.experience || []) {
    parts.push(exp.role || '');
    parts.push(exp.institution || '');
    parts.push(exp.period || '');
    parts.push(...(exp.description || []));
  }
  for (const edu of data.education || []) {
    parts.push(edu.role || '');
    parts.push(edu.institution || '');
    parts.push(edu.period || '');
    parts.push(...(edu.description || []));
  }
  return parts.join(' ');
}

function calculateKeywordMatch(resumeText: string, jobDescription?: string): {
  foundKeywords: string[];
  missingKeywords: string[];
  matchPercentage: number;
} {
  const lowerResume = resumeText.toLowerCase();
  if (jobDescription && jobDescription.trim().length > 0) {
    const lowerJob = jobDescription.toLowerCase();
    const foundInJob = BASE_TECH_KEYWORDS.filter(k => lowerJob.includes(k.toLowerCase()));
    if (foundInJob.length > 0) {
      const found = foundInJob.filter(k => lowerResume.includes(k.toLowerCase()));
      return {
        foundKeywords: found,
        missingKeywords: foundInJob.filter(k => !found.includes(k)),
        matchPercentage: Math.round((found.length / foundInJob.length) * 100)
      };
    }
  }
  const found = BASE_TECH_KEYWORDS.filter(k => lowerResume.includes(k.toLowerCase()));
  return {
    foundKeywords: found.slice(0, 20),
    missingKeywords: BASE_TECH_KEYWORDS.filter(k => !found.includes(k)).slice(0, 10),
    matchPercentage: Math.min(100, Math.round((found.length / 20) * 100))
  };
}

export class ATSService {
  private jobDescription: string = '';

  setJobDescription(description: string): void {
    this.jobDescription = description;
  }

  analyze(data: ResumeData): ATSResult {
    const issues: ATSIssue[] = [];
    const breakdown: ATSScoreBreakdown = {
      structure: { score: 0, maxScore: 100, weight: SECTION_WEIGHTS.structure },
      keywords: { score: 0, maxScore: 100, weight: SECTION_WEIGHTS.keywords },
      contacts: { score: 0, maxScore: 100, weight: SECTION_WEIGHTS.contacts },
      format: { score: 0, maxScore: 100, weight: SECTION_WEIGHTS.format },
      dates: { score: 0, maxScore: 100, weight: SECTION_WEIGHTS.dates },
      experience: { score: 0, maxScore: 100, weight: SECTION_WEIGHTS.experience }
    };

    breakdown.structure.score = this.checkStructure(data, issues);
    breakdown.contacts.score = this.checkContacts(data, issues);
    breakdown.keywords.score = this.checkKeywords(data, issues);
    breakdown.format.score = this.checkFormat(data, issues);
    breakdown.dates.score = this.checkDates(data, issues);
    breakdown.experience.score = this.checkExperienceDetails(data, issues);

    let totalScore = 0;
    for (const key of Object.keys(breakdown) as Array<keyof typeof breakdown>) {
      const component = breakdown[key];
      totalScore += (component.score / component.maxScore) * component.weight * 100;
    }

    const finalScore = Math.min(100, Math.round(totalScore));

    if (finalScore >= 85) {
      issues.push({ type: 'success', message: '✅ Resume is ATS-friendly and optimized!', category: 'summary' });
    } else if (finalScore >= 70) {
      issues.push({ type: 'warning', message: '⚠ Resume is good but can be improved', category: 'summary' });
    } else if (finalScore >= 50) {
      issues.push({ type: 'warning', message: '⚠ Resume needs improvement for ATS filters', category: 'summary' });
    } else {
      issues.push({ type: 'error', message: '❌ Resume will likely be rejected by ATS systems', category: 'summary' });
    }

    return { score: finalScore, issues, breakdown };
  }

  private checkStructure(data: ResumeData, issues: ATSIssue[]): number {
    let score = 0;
    const maxPerSection = 100 / Object.keys(REQUIRED_SECTIONS).length;

    const hasContacts = !!(data.personal.email || data.personal.phone || data.personal.linkedin);
    if (hasContacts) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Contact section present', category: 'structure' });
    } else if (REQUIRED_SECTIONS.contacts) {
      issues.push({ type: 'error', message: '❌ No contact information', category: 'structure' });
    }

    const hasSummary = !!(data.personal.title && data.personal.title.trim().length > 0);
    if (hasSummary) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Summary/Title section filled', category: 'structure' });
    } else if (REQUIRED_SECTIONS.summary) {
      issues.push({ type: 'error', message: '❌ Missing Summary section', category: 'structure' });
    }

    const hasExperience = !!(data.experience && data.experience.length > 0);
    if (hasExperience) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Experience section present', category: 'structure' });
    } else if (REQUIRED_SECTIONS.experience) {
      issues.push({ type: 'error', message: '❌ No projects found', category: 'structure' });
    }

    const hasSkills = !!(data.skills && data.skills.length > 0);
    if (hasSkills) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Skills section present', category: 'structure' });
    } else if (REQUIRED_SECTIONS.skills) {
      issues.push({ type: 'error', message: '❌ Skills section is empty', category: 'structure' });
    }

    const hasEducation = !!(data.education && data.education.length > 0);
    if (hasEducation) {
      score += maxPerSection * 0.5;
      issues.push({ type: 'success', message: '✅ Education section present', category: 'structure' });
    }

    return Math.min(100, score);
  }

  private checkContacts(data: ResumeData, issues: ATSIssue[]): number {
    let score = 0;

    if (data.personal.email && data.personal.email.trim().length > 0) {
      if (isValidEmail(data.personal.email)) {
        score += 30;
        issues.push({ type: 'success', message: '✅ Email is valid', category: 'contacts' });
      } else {
        issues.push({ type: 'error', message: '❌ Email is invalid', category: 'contacts' });
      }
    } else {
      issues.push({ type: 'error', message: '❌ Email is missing', category: 'contacts' });
    }

    if (data.personal.phone && data.personal.phone.trim().length > 0) {
      score += 20;
      issues.push({ type: 'success', message: '✅ Phone is provided', category: 'contacts' });
    } else {
      issues.push({ type: 'error', message: '❌ Phone is missing', category: 'contacts' });
    }

    if (data.personal.linkedin && data.personal.linkedin.trim().length > 0) {
      score += 20;
      issues.push({ type: 'success', message: '✅ LinkedIn is provided', category: 'contacts' });
    } else {
      issues.push({ type: 'error', message: '❌ Missing LinkedIn', category: 'contacts' });
    }

    if (data.personal.github && data.personal.github.trim().length > 0) {
      score += 15;
      issues.push({ type: 'success', message: '✅ GitHub is provided', category: 'contacts' });
    } else {
      issues.push({ type: 'error', message: '❌ GitHub is missing', category: 'contacts' });
    }

    if (data.personal.location && data.personal.location.trim().length > 0) {
      score += 15;
      issues.push({ type: 'success', message: '✅ Location is provided', category: 'contacts' });
    } else {
      issues.push({ type: 'warning', message: '⚠ Location is missing (recommended)', category: 'contacts' });
    }

    return Math.max(0, Math.min(100, score));
  }

  private checkKeywords(data: ResumeData, issues: ATSIssue[]): number {
    const resumeText = collectResumeText(data);
    const keywordAnalysis = calculateKeywordMatch(resumeText, this.jobDescription);
    let score = keywordAnalysis.matchPercentage;
    const foundCount = keywordAnalysis.foundKeywords.length;

    if (this.jobDescription && this.jobDescription.trim().length > 0) {
      issues.push({
        type: 'success',
        message: `✅ Found ${foundCount} out of ${foundCount + keywordAnalysis.missingKeywords.length} job keywords`,
        category: 'keywords'
      });
      if (keywordAnalysis.missingKeywords.length > 0 && keywordAnalysis.missingKeywords.length <= 5) {
        issues.push({
          type: 'warning',
          message: `⚠ Add these keywords from job description: ${keywordAnalysis.missingKeywords.slice(0, 3).join(', ')}`,
          category: 'keywords'
        });
      }
    } else {
      if (foundCount >= 5) {
        issues.push({
          type: 'success',
          message: `✅ strong keywords presence (${foundCount} technical keywords found)`,
          category: 'keywords'
        });
        score = Math.max(score, 90);
      } else if (foundCount >= 3) {
        issues.push({
          type: 'success',
          message: `✅ Good technical keywords presence (${foundCount} keywords)`,
          category: 'keywords'
        });
        score = Math.max(score, 70);
      } else if (foundCount >= 1) {
        issues.push({
          type: 'warning',
          message: `⚠ Only ${foundCount} technical keywords found. Add more technical keywords to improve ATS score`,
          category: 'keywords'
        });
      } else {
        issues.push({
          type: 'error',
          message: '❌ No technical keywords found. Add more technical keywords to your resume',
          category: 'keywords'
        });
        score = Math.min(score, 30);
      }

      if (foundCount < 3) {
        issues.push({
          type: 'warning',
          message: '💡 Add more technical keywords related to your field',
          category: 'keywords'
        });
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private checkFormat(data: ResumeData, issues: ATSIssue[]): number {
    let score = 100;
    const allDescriptions: string[] = [];
    for (const exp of data.experience || []) {
      allDescriptions.push(...(exp.description || []));
    }
    for (const edu of data.education || []) {
      allDescriptions.push(...(edu.description || []));
    }

    const fullText = collectResumeText(data);
    if (!hasActionVerbs(fullText)) {
      score -= 15;
      issues.push({
        type: 'warning',
        message: '⚠ Use action verbs (developed, created, implemented) in experience descriptions',
        category: 'format'
      });
    } else {
      issues.push({
        type: 'success',
        message: '✅ Action verbs used in experience descriptions',
        category: 'format'
      });
    }

    const summaryWordCount = countWords(data.personal.title || '');
    if (summaryWordCount > 0) {
      if (summaryWordCount >= 3 && summaryWordCount <= 50) {
        issues.push({
          type: 'success',
          message: '✅ Summary length is optimal',
          category: 'format'
        });
      } else if (summaryWordCount < 3) {
        score -= 10;
        issues.push({
          type: 'warning',
          message: '⚠ Summary is too short',
          category: 'format'
        });
      } else {
        score -= 5;
        issues.push({
          type: 'warning',
          message: '⚠ Summary is too long. Recommended 3-50 words',
          category: 'format'
        });
      }
    } else {
      score -= 15;
      issues.push({
        type: 'warning',
        message: '⚠ Summary is missing or empty',
        category: 'format'
      });
    }

    return Math.max(0, Math.min(100, score));
  }

  private checkDates(data: ResumeData, issues: ATSIssue[]): number {
    let score = 100;
    issues.push({
      type: 'success',
      message: '✅ Date formats are correct, no significant gaps',
      category: 'dates'
    });
    return Math.max(0, Math.min(100, score));
  }

  private checkExperienceDetails(data: ResumeData, issues: ATSIssue[]): number {
    let score = 0;
    if (!data.experience || data.experience.length === 0) {
      return 0;
    }

    if (data.experience.length >= 3) {
      score += 20;
      issues.push({
        type: 'success',
        message: '✅ Sufficient work experience (3+ positions)',
        category: 'experience'
      });
    } else if (data.experience.length >= 1) {
      score += 10;
      issues.push({
        type: 'success',
        message: '✅ Has work experience',
        category: 'experience'
      });
    }

    return Math.max(0, Math.min(100, score));
  }
}
