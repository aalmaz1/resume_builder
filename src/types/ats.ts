export interface ATSIssue {
  type: "error" | "warning" | "success" | "info";
  message: string;
  category?: "structure" | "contacts" | "keywords" | "format" | "dates" | "experience" | "summary" | "education" | "projects";
}

export interface ATSScoreComponent {
  score: number;
  maxScore: number;
  weight: number;
}

export interface ATSScoreBreakdown {
  structure: ATSScoreComponent;
  keywords: ATSScoreComponent;
  contacts: ATSScoreComponent;
  format: ATSScoreComponent;
  dates: ATSScoreComponent;
  experience: ATSScoreComponent;
  education: ATSScoreComponent;
}

export interface ATSResult {
  score: number;
  issues: ATSIssue[];
  breakdown?: ATSScoreBreakdown;
  profile?: ResumeProfile;
}

export type ResumeProfile = 'student' | 'technical' | 'management' | 'design' | 'other';
