export interface ATSIssue {
  type: "error" | "warning" | "success";
  message: string;
}

export interface ATSResult {
  score: number;
  issues: ATSIssue[];
}
