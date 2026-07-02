import { ResumeData } from '../types';
import { ATSResult, ATSIssue } from '../types/ats';

const KEYWORDS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Node',
  'HTML',
  'CSS',
  'Git',
  'API',
  'SQL',
  'Docker'
];

export class ATSService {
  analyze(data: ResumeData): ATSResult {
    const issues: ATSIssue[] = [];
    let score = 0;

    // Contact checks
    score += this.checkContacts(data, issues);

    // Summary check (using title as summary proxy if no explicit summary)
    score += this.checkSummary(data, issues);

    // Skills check
    score += this.checkSkills(data, issues);

    // Projects check (using experience as proxy)
    score += this.checkProjects(data, issues);

    // Experience check
    score += this.checkExperience(data, issues);

    // Keywords check
    score += this.checkKeywords(data, issues);

    // Cap score at 100
    score = Math.min(score, 100);

    // Add final status message
    if (score >= 80) {
      issues.push({ type: 'success', message: '✅ Resume looks ATS-friendly' });
    }

    return { score, issues };
  }

  private checkContacts(data: ResumeData, issues: ATSIssue[]): number {
    let points = 0;

    // Email: +15
    if (data.personal.email && data.personal.email.trim().length > 0) {
      points += 15;
      issues.push({ type: 'success', message: '✅ Email found' });
    } else {
      issues.push({ type: 'error', message: '❌ Email is missing' });
    }

    // GitHub: +10
    if (data.personal.github && data.personal.github.trim().length > 0) {
      points += 10;
      issues.push({ type: 'success', message: '✅ GitHub profile found' });
    }

    // Phone: +10
    if (data.personal.phone && data.personal.phone.trim().length > 0) {
      points += 10;
      issues.push({ type: 'success', message: '✅ Phone number found' });
    }

    // LinkedIn: +5
    if (data.personal.linkedin && data.personal.linkedin.trim().length > 0) {
      points += 5;
      issues.push({ type: 'success', message: '✅ LinkedIn found' });
    } else {
      issues.push({ type: 'error', message: '❌ Missing LinkedIn' });
    }

    return points;
  }

  private checkSummary(data: ResumeData, issues: ATSIssue[]): number {
    let points = 0;

    // Use title as a proxy for summary, or check experience descriptions
    const summary = data.personal.title || '';
    const hasSummary = summary.trim().length > 0;

    if (hasSummary) {
      points += 10;
      issues.push({ type: 'success', message: '✅ Summary/Title section complete' });

      if (summary.length > 50) {
        points += 5;
      } else if (summary.length > 0 && summary.length <= 50) {
        issues.push({ type: 'warning', message: '⚠ Summary is too short' });
      }

      if (summary.length > 100) {
        points += 5;
      }
    } else {
      issues.push({ type: 'warning', message: '⚠ Summary section is empty' });
    }

    return points;
  }

  private checkSkills(data: ResumeData, issues: ATSIssue[]): number {
    let points = 0;

    const allSkills: string[] = [];
    
    for (const skill of data.skills || []) {
      if (typeof skill === 'string') {
        allSkills.push(skill);
      } else {
        allSkills.push(...skill.items);
      }
    }

    const skillCount = allSkills.length;

    if (skillCount >= 1) {
      points += 5;
      issues.push({ type: 'success', message: '✅ Skills section has entries' });
    } else {
      issues.push({ type: 'error', message: '❌ Skills section is empty' });
      return points;
    }

    if (skillCount >= 5) {
      points += 10;
      issues.push({ type: 'success', message: '✅ 5+ skills listed' });
    }

    if (skillCount >= 10) {
      points += 15;
      issues.push({ type: 'success', message: '✅ 10+ skills listed' });
    }

    return points;
  }

  private checkProjects(data: ResumeData, issues: ATSIssue[]): number {
    let points = 0;

    // Count projects from experience entries (as proxy for projects)
    const projectCount = data.experience?.length || 0;

    if (projectCount >= 1) {
      points += 5;
      issues.push({ type: 'success', message: '✅ Experience/Projects found' });
    } else {
      issues.push({ type: 'error', message: '❌ No projects found' });
      return points;
    }

    if (projectCount >= 3) {
      points += 10;
      issues.push({ type: 'success', message: '✅ 3+ projects/experiences' });
    }

    if (projectCount >= 5) {
      points += 15;
      issues.push({ type: 'success', message: '✅ 5+ projects/experiences' });
    }

    return points;
  }

  private checkExperience(data: ResumeData, issues: ATSIssue[]): number {
    let points = 0;

    if (!data.experience || data.experience.length === 0) {
      return points;
    }

    // Check if experience is filled
    const hasExperience = data.experience.some(exp => 
      exp.role && exp.role.trim().length > 0
    );

    if (hasExperience) {
      points += 10;
      issues.push({ type: 'success', message: '✅ Experience section complete' });

      // Check description length
      const totalDescriptionLength = data.experience.reduce((acc, exp) => {
        return acc + (exp.description?.join(' ').length || 0);
      }, 0);

      if (totalDescriptionLength > 100) {
        points += 5;
        issues.push({ type: 'success', message: '✅ Detailed experience descriptions' });
      }
    }

    return points;
  }

  private checkKeywords(data: ResumeData, issues: ATSIssue[]): number {
    let points = 0;

    // Collect all text content from resume
    const textContent: string[] = [];

    // Personal info
    textContent.push(data.personal.title || '');
    textContent.push(data.personal.location || '');

    // Skills
    for (const skill of data.skills || []) {
      if (typeof skill === 'string') {
        textContent.push(skill);
      } else {
        textContent.push(skill.category);
        textContent.push(...skill.items);
      }
    }

    // Experience
    for (const exp of data.experience || []) {
      textContent.push(exp.role);
      textContent.push(exp.institution);
      textContent.push(...(exp.description || []));
    }

    // Education
    for (const edu of data.education || []) {
      textContent.push(edu.role);
      textContent.push(edu.institution);
      textContent.push(...(edu.description || []));
    }

    const fullText = textContent.join(' ').toLowerCase();

    // Count matching keywords
    const foundKeywords = KEYWORDS.filter(keyword => 
      fullText.includes(keyword.toLowerCase())
    );

    const keywordCount = foundKeywords.length;

    if (keywordCount >= 3) {
      points += 5;
      issues.push({ type: 'success', message: `✅ Found ${keywordCount}+ technical keywords` });
    } else {
      issues.push({ type: 'warning', message: '⚠ Add more technical keywords' });
    }

    if (keywordCount >= 5) {
      points += 10;
      issues.push({ type: 'success', message: `✅ Found ${keywordCount}+ strong keywords` });
    }

    return points;
  }
}
