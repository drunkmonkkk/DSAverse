export const languages = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C",
] as const;
export type Language = (typeof languages)[number];
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Topic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  level: number;
  prerequisites: string[];
  estimated_minutes: number;
  learning_objectives: string[];
  explanation: string;
  examples: string[];
  common_mistakes: string[];
  time_complexity: string;
  space_complexity: string;
  visualizer_type: string | null;
  code_examples: Record<Language, string>;
  related_problems: string[];
};
export type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  patterns: string[];
  problem_url: string;
  estimated_minutes: number;
  prerequisites: string[];
};
export type Status = "NOT_STARTED" | "ATTEMPTED" | "SOLVED" | "REVISIT";
export type Activity = {
  id: string;
  kind: "topic" | "problem" | "session" | "revision";
  target: string;
  at: string;
  minutes: number;
  xp: number;
};
export type Progress = {
  version: 1;
  topics: Record<string, "IN_PROGRESS" | "COMPLETED">;
  problems: Record<string, Status>;
  notes: Record<string, string>;
  bookmarks: string[];
  revisions: Record<string, string>;
  events: Activity[];
  preferences: {
    name: string;
    language: Language;
    timezone: string;
    theme: "dark" | "light";
    dailyMinutes: number;
    experience: "Beginner" | "Intermediate" | "Advanced";
    goal: string;
    interests: string[];
  };
};
export type Step = {
  step_id: number;
  description: string;
  operation: string;
  active_elements: number[];
  highlighted_code_lines: number[];
  variables: Record<string, string | number>;
  data_structure_state: number[];
  complexity_note: string;
  edges?: [number, number, number?][];
  labels?: string[];
};
