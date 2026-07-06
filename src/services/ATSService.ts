import { ResumeData } from '../types';
import { ATSResult, ATSIssue, ATSScoreBreakdown } from '../types/ats';

// ============================================================================
// CONFIGURATION & WEIGHTS
// ============================================================================

const SECTION_WEIGHTS = {
  structure: 0.20,      // Наличие обязательных разделов
  keywords: 0.35,       // Совпадение ключевых слов (с вакансией или базовых)
  contacts: 0.15,       // Полнота контактной информации
  format: 0.15,         // Форматирование и читаемость
  dates: 0.10,          // Корректность дат
  experience: 0.05      // Детализация опыта
};

// Базовый список технических ключевых слов (расширенный)
const BASE_TECH_KEYWORDS = [
  // Languages
  'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala',
  // Frontend
  'React', 'Vue', 'Angular', 'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Vite', 'Next.js', 'Nuxt',
  // Backend
  'Node', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Laravel', 'Rails',
  // Database
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle',
  // DevOps & Cloud
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitLab', 'GitHub Actions', 'Terraform',
  // Tools & Practices
  'Git', 'API', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'TDD', 'Linux', 'Bash',
  // Testing
  'Jest', 'Mocha', 'pytest', 'JUnit', 'Cypress', 'Playwright'
];

// Глаголы действия для описания опыта (ATS-friendly)
const ACTION_VERBS = [
  'developed', 'created', 'built', 'implemented', 'designed', 'architected', 'led', 'managed',
  'optimized', 'improved', 'reduced', 'increased', 'automated', 'deployed', 'maintained',
  'collaborated', 'mentored', 'trained', 'coordinated', 'delivered', 'launched', 'integrated',
  'migrated', 'refactored', 'debugged', 'tested', 'documented', 'analyzed', 'researched'
];

// Обязательные разделы резюме
const REQUIRED_SECTIONS = {
  contacts: true,
  summary: true,
  experience: true,
  education: false, // Опционально для некоторых позиций
  skills: true
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Проверка валидности email через regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Проверка формата телефона (международный или локальный)
 */
function isValidPhone(phone: string): boolean {
  // Удаляем все нецифровые символы кроме +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Минимум 7 цифр для валидного номера
  return cleaned.length >= 7 && /^\+?\d+$/.test(cleaned);
}

/**
 * Проверка формата даты (MM/YYYY, YYYY, MM/YYYY - Present, и т.д.)
 */
function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr || dateStr.trim().length === 0) return false;
  
  const patterns = [
    /^\d{1,2}\/\d{4}$/,                    // MM/YYYY
    /^\d{4}$/,                              // YYYY
    /^\d{1,2}\/\d{4}\s*-\s*(Present|now)?$/i, // MM/YYYY - Present
    /^\d{4}\s*-\s*\d{4}$/,                 // YYYY - YYYY
    /^\d{4}\s*-\s*Present$/i,              // YYYY - Present
    /^\w+\s+\d{4}$/,                       // Month YYYY
    /^\w+\s+\d{4}\s*-\s*(Present|now|\d{4})$/i // Month YYYY - Present/YYYY
  ];
  
  return patterns.some(pattern => pattern.test(dateStr.trim()));
}

/**
 * Парсинг периода работы в месяцы для проверки пробелов
 */
function parsePeriodToMonths(period: string): { start: number, end: number | null } | null {
  if (!period) return null;
  
  const clean = period.trim();
  let startMonth = 0;
  let endMonth: number | null = null;
  
  // Попытка извлечь годы
  const yearMatch = clean.match(/(\d{4})/g);
  if (!yearMatch || yearMatch.length === 0) return null;
  
  const currentYear = new Date().getFullYear();
  const startYear = parseInt(yearMatch[0]);
  
  // Если есть второй год/дата
  if (yearMatch.length >= 2) {
    const endYear = parseInt(yearMatch[1]);
    if (endYear > currentYear) return null; // Будущая дата
    
    // Примерная конвертация в месяцы (для проверки больших пробелов)
    startMonth = (startYear - 2000) * 12;
    endMonth = (endYear - 2000) * 12;
  } else {
    // Только начало, проверяем что не слишком давно
    if (startYear < 2000 || startYear > currentYear) return null;
    startMonth = (startYear - 2000) * 12;
  }
  
  return { start: startMonth, end: endMonth };
}

/**
 * Подсчёт количества слов в тексте
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Проверка наличия глаголов действия в описании
 */
function hasActionVerbs(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ACTION_VERBS.some(verb => lowerText.includes(verb));
}

/**
 * Сбор всего текстового содержимого резюме
 */
function collectResumeText(data: ResumeData): string {
  const parts: string[] = [];
  
  // Personal info
  parts.push(data.personal.name || '');
  parts.push(data.personal.title || '');
  parts.push(data.personal.location || '');
  
  // Skills
  for (const skill of data.skills || []) {
    if (typeof skill === 'string') {
      parts.push(skill);
    } else {
      parts.push(skill.category);
      parts.push(...skill.items);
    }
  }
  
  // Experience
  for (const exp of data.experience || []) {
    parts.push(exp.role || '');
    parts.push(exp.institution || '');
    parts.push(exp.period || '');
    parts.push(...(exp.description || []));
  }
  
  // Education
  for (const edu of data.education || []) {
    parts.push(edu.role || '');
    parts.push(edu.institution || '');
    parts.push(edu.period || '');
    parts.push(...(edu.description || []));
  }
  
  return parts.join(' ');
}

/**
 * Проверка совпадения ключевых слов с вакансией
 */
function calculateKeywordMatch(resumeText: string, jobDescription?: string): {
  foundKeywords: string[];
  missingKeywords: string[];
  matchPercentage: number;
} {
  const lowerResume = resumeText.toLowerCase();
  
  // Если есть описание вакансии, используем его для извлечения ключевых слов
  if (jobDescription && jobDescription.trim().length > 0) {
    // Простая эвристика: ищем технические термины в описании вакансии
    const lowerJob = jobDescription.toLowerCase();
    const foundInJob = BASE_TECH_KEYWORDS.filter(k => 
      lowerJob.includes(k.toLowerCase())
    );
    
    if (foundInJob.length > 0) {
      const found = foundInJob.filter(k => lowerResume.includes(k.toLowerCase()));
      return {
        foundKeywords: found,
        missingKeywords: foundInJob.filter(k => !found.includes(k)),
        matchPercentage: Math.round((found.length / foundInJob.length) * 100)
      };
    }
  }
  
  // Без вакансии: проверяем наличие базовых ключевых слов
  const found = BASE_TECH_KEYWORDS.filter(k => lowerResume.includes(k.toLowerCase()));
  return {
    foundKeywords: found.slice(0, 20), // Ограничиваем список
    missingKeywords: BASE_TECH_KEYWORDS.filter(k => !found.includes(k)).slice(0, 10),
    matchPercentage: Math.min(100, Math.round((found.length / 20) * 100))
  };
}

/**
 * Оценка длины и структуры предложений
 */
function analyzeReadability(texts: string[]): {
  avgSentenceLength: number;
  hasBulletPoints: boolean;
  recommendation?: string;
} {
  let totalSentences = 0;
  let totalWords = 0;
  let hasBullets = false;
  
  for (const text of texts) {
    // Подсчёт предложений (по точкам, восклицательным и вопросительным знакам)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    totalSentences += sentences.length;
    totalWords += countWords(text);
    
    // Проверка на маркеры списка
    if (/^[•●○■□▪▫→⇒\-*]\s/m.test(text)) {
      hasBullets = true;
    }
  }
  
  const avgLength = totalSentences > 0 ? Math.round(totalWords / totalSentences) : 0;
  
  let recommendation: string | undefined;
  if (avgLength > 25) {
    recommendation = 'Предложения слишком длинные. Рекомендуется использовать более короткие формулировки (15-20 слов).';
  } else if (avgLength < 8 && totalSentences > 0) {
    recommendation = 'Предложения очень короткие. Добавьте больше деталей в описание.';
  }
  
  return {
    avgSentenceLength: avgLength,
    hasBulletPoints: hasBullets,
    recommendation
  };
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class ATSService {
  private jobDescription: string = '';
  
  /**
   * Установка описания вакансии для сравнения
   */
  setJobDescription(description: string): void {
    this.jobDescription = description;
  }
  
  /**
   * Основной метод анализа резюме
   */
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
    
    // 1. Проверка структуры (наличие разделов)
    breakdown.structure.score = this.checkStructure(data, issues);
    
    // 2. Проверка контактов
    breakdown.contacts.score = this.checkContacts(data, issues);
    
    // 3. Проверка ключевых слов
    breakdown.keywords.score = this.checkKeywords(data, issues);
    
    // 4. Проверка форматирования и читаемости
    breakdown.format.score = this.checkFormat(data, issues);
    
    // 5. Проверка дат
    breakdown.dates.score = this.checkDates(data, issues);
    
    // 6. Проверка детализации опыта
    breakdown.experience.score = this.checkExperienceDetails(data, issues);
    
    // Вычисление итогового балла по взвешенной формуле
    let totalScore = 0;
    for (const key of Object.keys(breakdown) as Array<keyof typeof breakdown>) {
      const component = breakdown[key];
      totalScore += (component.score / component.maxScore) * component.weight * 100;
    }
    
    // Округление и ограничение до 100
    const finalScore = Math.min(100, Math.round(totalScore));
    
    // Добавление финального сообщения
    if (finalScore >= 85) {
      issues.push({ 
        type: 'success', 
        message: '✅ Резюме отлично оптимизировано для ATS систем!',
        category: 'summary'
      });
    } else if (finalScore >= 70) {
      issues.push({ 
        type: 'warning', 
        message: '⚠ Резюме хорошее, но есть возможности для улучшения',
        category: 'summary'
      });
    } else if (finalScore >= 50) {
      issues.push({ 
        type: 'warning', 
        message: '⚠ Резюме требует доработки для прохождения ATS фильтров',
        category: 'summary'
      });
    } else {
      issues.push({ 
        type: 'error', 
        message: '❌ Резюме с высокой вероятностью будет отклонено ATS системами',
        category: 'summary'
      });
    }
    
    return { 
      score: finalScore, 
      issues,
      breakdown
    };
  }

  // ============================================================================
  // STRUCTURE CHECK (20%)
  // ============================================================================
  
  private checkStructure(data: ResumeData, issues: ATSIssue[]): number {
    let score = 0;
    const maxPerSection = 100 / Object.keys(REQUIRED_SECTIONS).length;
    
    // Контакты (обязательно)
    const hasContacts = !!(data.personal.email || data.personal.phone || data.personal.linkedin);
    if (hasContacts) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Раздел контактов присутствует', category: 'structure' });
    } else if (REQUIRED_SECTIONS.contacts) {
      issues.push({ type: 'error', message: '❌ Отсутствует контактная информация', category: 'structure' });
    }
    
    // Summary/Title (обязательно)
    const hasSummary = !!(data.personal.title && data.personal.title.trim().length > 10);
    if (hasSummary) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Раздел Summary/Title заполнен', category: 'structure' });
    } else if (REQUIRED_SECTIONS.summary) {
      issues.push({ type: 'error', message: '❌ Отсутствует раздел Summary или профессиональный заголовок', category: 'structure' });
    }
    
    // Опыт работы (обязательно)
    const hasExperience = !!(data.experience && data.experience.length > 0);
    if (hasExperience) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Раздел опыта работы присутствует', category: 'structure' });
    } else if (REQUIRED_SECTIONS.experience) {
      issues.push({ type: 'error', message: '❌ Отсутствует раздел опыта работы', category: 'structure' });
    }
    
    // Навыки (обязательно)
    const hasSkills = !!(data.skills && data.skills.length > 0);
    if (hasSkills) {
      score += maxPerSection;
      issues.push({ type: 'success', message: '✅ Раздел навыков присутствует', category: 'structure' });
    } else if (REQUIRED_SECTIONS.skills) {
      issues.push({ type: 'error', message: '❌ Отсутствует раздел навыков', category: 'structure' });
    }
    
    // Образование (опционально, бонусные баллы)
    const hasEducation = !!(data.education && data.education.length > 0);
    if (hasEducation) {
      score += maxPerSection * 0.5; // Половина баллов как бонус
      issues.push({ type: 'success', message: '✅ Раздел образования присутствует', category: 'structure' });
    }
    
    return Math.min(100, score);
  }

  // ============================================================================
  // CONTACTS CHECK (15%)
  // ============================================================================
  
  private checkContacts(data: ResumeData, issues: ATSIssue[]): number {
    let score = 0;
    const contactChecks = [
      { 
        field: 'email', 
        label: 'Email', 
        validator: (v: string) => v.trim().length > 0 && isValidEmail(v),
        error: '❌ Email отсутствует или невалиден',
        success: '✅ Email указан корректно',
        weight: 30 
      },
      { 
        field: 'phone', 
        label: 'Телефон', 
        validator: (v: string) => v.trim().length > 0,
        error: '❌ Телефон не указан',
        success: '✅ Телефон указан',
        weight: 20 
      },
      { 
        field: 'linkedin', 
        label: 'LinkedIn', 
        validator: (v: string) => v.trim().length > 0,
        error: '❌ LinkedIn профиль не указан',
        success: '✅ LinkedIn профиль указан',
        weight: 20 
      },
      { 
        field: 'github', 
        label: 'GitHub', 
        validator: (v: string) => v.trim().length > 0,
        error: '❌ GitHub профиль не указан',
        success: '✅ GitHub профиль указан',
        weight: 15 
      },
      { 
        field: 'location', 
        label: 'Локация', 
        validator: (v: string) => v.trim().length > 0,
        error: '⚠ Локация не указана (рекомендуется)',
        success: '✅ Локация указана',
        weight: 15 
      }
    ];
    
    for (const check of contactChecks) {
      const value = (data.personal as any)[check.field] || '';
      const isValid = check.validator(value);
      
      if (isValid) {
        score += check.weight;
        issues.push({ type: 'success', message: check.success, category: 'contacts' });
      } else {
        issues.push({ 
          type: check.field === 'location' ? 'warning' : 'error', 
          message: check.error, 
          category: 'contacts' 
        });
      }
    }
    
    // Дополнительная проверка формата email
    if (data.personal.email && !isValidEmail(data.personal.email)) {
      issues.push({ 
        type: 'error', 
        message: '❌ Неверный формат email адреса', 
        category: 'contacts' 
      });
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // ============================================================================
  // KEYWORDS CHECK (35%)
  // ============================================================================
  
  private checkKeywords(data: ResumeData, issues: ATSIssue[]): number {
    const resumeText = collectResumeText(data);
    const keywordAnalysis = calculateKeywordMatch(resumeText, this.jobDescription);
    
    let score = 0;
    
    // Базовый процент совпадения
    score = keywordAnalysis.matchPercentage;
    
    if (this.jobDescription && this.jobDescription.trim().length > 0) {
      // Анализ под конкретную вакансию
      issues.push({ 
        type: 'success', 
        message: `✅ Найдено ${keywordAnalysis.foundKeywords.length} из ${keywordAnalysis.foundKeywords.length + keywordAnalysis.missingKeywords.length} ключевых слов вакансии`,
        category: 'keywords'
      });
      
      if (keywordAnalysis.missingKeywords.length > 0 && keywordAnalysis.missingKeywords.length <= 5) {
        issues.push({ 
          type: 'warning', 
          message: `⚠ Добавьте эти ключевые слова из вакансии: ${keywordAnalysis.missingKeywords.slice(0, 3).join(', ')}`,
          category: 'keywords'
        });
      }
    } else {
      // Общий анализ без вакансии
      if (keywordAnalysis.foundKeywords.length >= 10) {
        issues.push({ 
          type: 'success', 
          message: `✅ Найдено ${keywordAnalysis.foundKeywords.length} технических ключевых слов`,
          category: 'keywords'
        });
        score = Math.max(score, 80);
      } else if (keywordAnalysis.foundKeywords.length >= 5) {
        issues.push({ 
          type: 'warning', 
          message: `⚠ Найдено только ${keywordAnalysis.foundKeywords.length} технических ключевых слов. Рекомендуется добавить больше`,
          category: 'keywords'
        });
      } else {
        issues.push({ 
          type: 'error', 
          message: `❌ Критически мало технических ключевых слов (${keywordAnalysis.foundKeywords.length}). Добавьте навыки и технологии`,
          category: 'keywords'
        });
        score = Math.min(score, 40);
      }
      
      // Рекомендации по недостающим ключевым словам
      if (keywordAnalysis.missingKeywords.length > 0) {
        const topMissing = keywordAnalysis.missingKeywords.slice(0, 5);
        issues.push({ 
          type: 'warning', 
          message: `💡 Рассмотрите возможность добавления: ${topMissing.join(', ')}`,
          category: 'keywords'
        });
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // ============================================================================
  // FORMAT CHECK (15%)
  // ============================================================================
  
  private checkFormat(data: ResumeData, issues: ATSIssue[]): number {
    let score = 100;
    
    // Сбор всех текстовых описаний для анализа читаемости
    const allDescriptions: string[] = [];
    
    for (const exp of data.experience || []) {
      allDescriptions.push(...(exp.description || []));
    }
    for (const edu of data.education || []) {
      allDescriptions.push(...(edu.description || []));
    }
    
    // Анализ читаемости
    const readability = analyzeReadability(allDescriptions);
    
    if (readability.avgSentenceLength > 25) {
      score -= 20;
      issues.push({ 
        type: 'warning', 
        message: `⚠ Средняя длина предложения: ${readability.avgSentenceLength} слов. Рекомендуется сократить до 15-20 слов`,
        category: 'format'
      });
    }
    
    if (!readability.hasBulletPoints && allDescriptions.length > 0) {
      score -= 10;
      issues.push({ 
        type: 'warning', 
        message: '⚠ Используйте маркированные списки для лучшего восприятия',
        category: 'format'
      });
    }
    
    // Проверка на использование глаголов действия
    const fullText = collectResumeText(data);
    if (!hasActionVerbs(fullText)) {
      score -= 15;
      issues.push({ 
        type: 'warning', 
        message: '⚠ Используйте глаголы действия (developed, created, implemented) в описании опыта',
        category: 'format'
      });
    } else {
      issues.push({ 
        type: 'success', 
        message: '✅ Использованы глаголы действия в описании опыта',
        category: 'format'
      });
    }
    
    // Проверка длины Summary
    const summaryLength = countWords(data.personal.title || '');
    if (summaryLength > 0) {
      if (summaryLength >= 10 && summaryLength <= 50) {
        issues.push({ 
          type: 'success', 
          message: '✅ Оптимальная длина профессионального заголовка/Summary',
          category: 'format'
        });
      } else if (summaryLength < 10) {
        score -= 10;
        issues.push({ 
          type: 'warning', 
          message: '⚠ Профессиональный заголовок слишком короткий (менее 10 слов)',
          category: 'format'
        });
      } else {
        score -= 5;
        issues.push({ 
          type: 'warning', 
          message: '⚠ Профессиональный заголовок слишком длинный. Рекомендуется 10-50 слов',
          category: 'format'
        });
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // ============================================================================
  // DATES CHECK (10%)
  // ============================================================================
  
  private checkDates(data: ResumeData, issues: ATSIssue[]): number {
    let score = 100;
    let invalidDateCount = 0;
    let hasLargeGap = false;
    
    const checkEntityDates = (entities: any[], entityType: string) => {
      for (const entity of entities) {
        const period = entity.period || '';
        
        if (period && period.trim().length > 0) {
          if (!isValidDateFormat(period)) {
            invalidDateCount++;
            issues.push({ 
              type: 'warning', 
              message: `⚠ Нестандартный формат даты в ${entityType}: "${period}". Рекомендуется MM/YYYY или YYYY`,
              category: 'dates'
            });
            score -= 15;
          }
        }
      }
    };
    
    checkEntityDates(data.experience || [], 'опыте работы');
    checkEntityDates(data.education || [], 'образовании');
    
    // Проверка на большие пробелы в опыте
    if (data.experience && data.experience.length >= 2) {
      const periods = data.experience
        .map(e => parsePeriodToMonths(e.period || ''))
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .sort((a, b) => b.start - a.start); // Сортировка от новых к старым
      
      for (let i = 0; i < periods.length - 1; i++) {
        const current = periods[i];
        const previous = periods[i + 1];
        
        if (current.end !== null) {
          const gap = current.end - previous.start;
          if (gap > 12) { // Пробел больше 1 года (12 месяцев)
            hasLargeGap = true;
            issues.push({ 
              type: 'warning', 
              message: `⚠ Обнаружен пробел в опыте работы более 1 года. Будьте готовы объяснить это работодателю`,
              category: 'dates'
            });
            score -= 10;
            break;
          }
        }
      }
    }
    
    if (invalidDateCount === 0 && !hasLargeGap) {
      issues.push({ 
        type: 'success', 
        message: '✅ Формат дат корректный, значительных пробелов не обнаружено',
        category: 'dates'
      });
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // ============================================================================
  // EXPERIENCE DETAILS CHECK (5%)
  // ============================================================================
  
  private checkExperienceDetails(data: ResumeData, issues: ATSIssue[]): number {
    let score = 0;
    
    if (!data.experience || data.experience.length === 0) {
      return 0;
    }
    
    let totalDescriptionLength = 0;
    let entriesWithDetails = 0;
    
    for (const exp of data.experience) {
      const descLength = exp.description?.reduce((acc, d) => acc + d.length, 0) || 0;
      totalDescriptionLength += descLength;
      
      if (descLength > 50) {
        entriesWithDetails++;
      }
      
      // Проверка на наличие количественных показателей
      const descText = exp.description?.join(' ') || '';
      if (/\d+%|\d+x|\$\d+|\d+\s*(лет|года|год|years?|months?)/i.test(descText)) {
        score += 10;
      }
    }
    
    // Средняя детализация
    const avgDescLength = data.experience.length > 0 
      ? totalDescriptionLength / data.experience.length 
      : 0;
    
    if (avgDescLength > 100) {
      score += 30;
      issues.push({ 
        type: 'success', 
        message: '✅ Подробное описание опыта работы',
        category: 'experience'
      });
    } else if (avgDescLength > 50) {
      score += 20;
      issues.push({ 
        type: 'success', 
        message: '✅ Хорошая детализация опыта',
        category: 'experience'
      });
    } else {
      issues.push({ 
        type: 'warning', 
        message: '⚠ Описание опыта работы слишком краткое. Добавьте больше деталей о достижениях',
        category: 'experience'
      });
    }
    
    // Количество записей с деталями
    if (entriesWithDetails >= data.experience.length) {
      score += 20;
      issues.push({ 
        type: 'success', 
        message: '✅ Все позиции имеют подробное описание',
        category: 'experience'
      });
    } else if (entriesWithDetails >= Math.ceil(data.experience.length / 2)) {
      score += 10;
      issues.push({ 
        type: 'warning', 
        message: '⚠ Некоторые позиции имеют краткое описание',
        category: 'experience'
      });
    }
    
    // Количество мест работы
    if (data.experience.length >= 3) {
      score += 20;
      issues.push({ 
        type: 'success', 
        message: '✅ Достаточно опыта работы (3+ места)',
        category: 'experience'
      });
    } else if (data.experience.length >= 1) {
      score += 10;
      issues.push({ 
        type: 'success', 
        message: '✅ Есть опыт работы',
        category: 'experience'
      });
    }
    
    return Math.max(0, Math.min(100, score));
  }
}
