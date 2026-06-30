export type TutorialCue = "speak" | "cue" | "prompt" | "run" | "check";
export type TutorialAudience = "dialogue" | "visual";

export type TutorialBlock =
  | { type: "speak" | "cue"; title: string; paragraphs: string[]; audience?: TutorialAudience }
  | { type: "prompt" | "run"; title: string; code: string; audience?: TutorialAudience }
  | { type: "list" | "check"; title: string; items: string[]; audience?: TutorialAudience };

export type TutorialSegment = {
  id: string;
  timeRange: string;
  title: string;
  priority?: "key" | "optional";
  goal: string;
  blocks: TutorialBlock[];
  recordingNotes?: string[];
  editingNotes?: string[];
};
