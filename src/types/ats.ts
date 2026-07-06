// src/types/ats.ts

export interface ATSIssue {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  category: 'structure' | 'contacts' | 'keywords' | 'format' | 'dates' | 'experience' | 'summary' | 'education' | 'projects';
  field?: string; // опционально, если нужно указать конкретное поле
}

export interface ATSScoreBreakdown {
  structure: number;   // балл за структуру (0-100)
  contacts: number;    // балл за контакты (0-100)
  keywords: number;    // балл за ключевые слова (0-100)
  format: number;      // балл за формат/читаемость (0-100)
  dates: number;       // балл за даты (0-100)
  experience: number;  // балл за опыт (0-100)
  summary: number;     // балл за суммарную оценку (0-100) – если используется
  education: number;   // НОВОЕ: балл за образование (0-100)
  projects?: number;   // опционально, если вы используете проекты как отдельную категорию
}

export interface ATSResult {
  score: number;                  // итоговый балл (0-100)
  issues: ATSIssue[];            // список проблем/рекомендаций
  breakdown: ATSScoreBreakdown;  // детализация по компонентам
  profile?: string;              // опционально: определённый профиль (technical, student, design, management, other)
}
