import type { TutorialSegment } from "@/data/tutorial";

export const tutorialOverview = {
  title: "Sample Tutorial Recording Plan",
  targetLength: "About 5 minutes",
  recordingLayout: "Browser on the left, editor / terminal / notes on the right",
  goal: "Demonstrate how to organize a short technical tutorial into repeatable recording segments.",
  coreMessage: "Plan the story, record each segment, and verify the result as you go.",
  audience: "Creators preparing a concise technical walkthrough.",
  prerequisites: [
    "A working local development environment.",
    "A clear feature or workflow to teach.",
    "Screen recording software with separate microphone audio if possible.",
  ],
  resources: {
    projectRepo: "",
    documentation: "",
  },
};

export const tutorialSegments: TutorialSegment[] = [
  {
    id: "segment-introduction",
    timeRange: "0:00–0:45",
    title: "Introduce the Result",
    goal: "Show the finished outcome first so viewers understand why the tutorial matters.",
    blocks: [
      {
        type: "speak",
        title: "Narration",
        paragraphs: [
          "In this tutorial, we’ll build a small feature from start to finish and keep every step easy to verify.",
          "I’ll show the final result first, then we’ll work backward through the data, UI, and build checks that make it reliable.",
        ],
      },
      {
        type: "list",
        title: "Show",
        items: [
          "Open the finished page or component.",
          "Trigger the main interaction once.",
          "Point to the files that will be edited during the tutorial.",
        ],
      },
      {
        type: "check",
        title: "Verify",
        items: [
          "The viewer can see the end state before implementation starts.",
          "The tutorial promise is clear and specific.",
        ],
      },
    ],
    recordingNotes: [
      "Keep this section short; do not explain implementation details yet.",
      "Have the finished demo already loaded before recording.",
    ],
    editingNotes: [
      "Add a title card or lower-third with the tutorial promise.",
      "Cut pauses while switching between browser and editor.",
    ],
  },
  {
    id: "segment-implementation",
    timeRange: "0:45–3:45",
    title: "Build the Core Flow",
    priority: "key",
    goal: "Capture the main implementation while separating narration from visible actions.",
    blocks: [
      {
        type: "speak",
        title: "Narration",
        paragraphs: [
          "Now we’ll implement the smallest version of the feature. The goal is not to cover every edge case yet — it’s to get a working path on screen.",
        ],
      },
      {
        type: "prompt",
        title: "Prompt to paste",
        code: "Implement the smallest working version of this tutorial feature. Keep the data typed, keep components focused, and add enough UI states that the result is easy to verify in the browser.",
      },
      {
        type: "list",
        title: "While AI works",
        audience: "dialogue",
        items: [
          "Explain the current file structure.",
          "Call out the main data shape or component boundary.",
          "Remind viewers what success will look like in the browser.",
        ],
      },
      {
        type: "list",
        title: "Show",
        items: [
          "Open the primary component file.",
          "Highlight the typed data model or props.",
          "Switch to the browser and exercise the feature.",
        ],
      },
      {
        type: "run",
        title: "Run local development server",
        code: "npm run dev",
      },
      {
        type: "check",
        title: "Verify",
        items: [
          "The feature renders without console errors.",
          "The primary interaction works from the browser UI.",
          "The code path is easy to explain in one or two sentences.",
        ],
      },
    ],
    recordingNotes: [
      "This is the main teaching segment; slow down when explaining the key abstraction.",
    ],
    editingNotes: [
      "Speed up repetitive typing or package installation.",
      "Use zooms or highlights for the key lines viewers should remember.",
    ],
  },
  {
    id: "segment-recap",
    timeRange: "3:45–5:00",
    title: "Verify and Recap",
    goal: "Run final checks and restate the reusable lesson.",
    blocks: [
      {
        type: "speak",
        title: "Narration",
        paragraphs: [
          "Before we wrap, let’s confirm the project still passes the same checks a contributor would run locally.",
          "The reusable pattern is simple: start with the smallest working flow, isolate the important boundary, and verify the result before adding complexity.",
        ],
      },
      {
        type: "run",
        title: "Check TypeScript and production build",
        code: "npm run build",
      },
      {
        type: "list",
        title: "Show",
        items: [
          "Terminal with the successful build output.",
          "Browser with the final interaction one more time.",
          "A brief list of next steps or links for viewers.",
        ],
      },
      {
        type: "check",
        title: "Verify",
        items: [
          "The build completes successfully.",
          "The final result still matches the opening demo.",
        ],
      },
    ],
    recordingNotes: ["Do not re-explain every implementation detail in the recap."],
    editingNotes: ["End with the same visual result used in the opening hook."],
  },
];

export const youtubeChapters = tutorialSegments.map((segment) => {
  const [start] = segment.timeRange.split(/[–-]/);
  return `${start.trim()} ${segment.title}`;
});

