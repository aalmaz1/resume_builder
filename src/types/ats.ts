export interface ATSIssue {
  type: "error" | "warning" | "success";
  message: string;
  category?: "structure" | "contacts" | "keywords" | "format" | "dates" | "experience" | "summary" | "education";
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
}
