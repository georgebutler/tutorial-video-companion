# Tutorial Video Companion

A React companion app for planning, recording, and tracking tutorial videos. It turns a typed tutorial script into a two-column recording checklist with narration, visual actions, copyable prompts/commands, verification steps, recording notes, editing notes, sidebar navigation, and local progress tracking.

The project ships with generic public sample content so a fresh clone builds immediately. You can keep project-specific scripts in a gitignored private content folder for local recording work.

## Features

- Segment-based tutorial script data in TypeScript.
- Dialogue and visual/action columns for each segment.
- Copy buttons for prompt and command blocks.
- Recording progress checkboxes saved in `localStorage`.
- Sticky sidebar with active-segment navigation.
- Public sample content plus optional private local content.

## Getting Started

```bash
npm install
npm run dev
```

Open the local Vite URL shown in your terminal.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run lint` — run the TypeScript build check.
- `npm run build` — run the TypeScript build check and create a production build.
- `npm run preview` — preview the production build locally.

## Content Workflow

Tutorial data is typed by `src/data/tutorial.ts` and loaded through the neutral `@tutorial-content` alias.

By default, the app resolves content in this order:

1. `src/content/private/tutorialContent.ts`
2. `src/content/public/tutorialContent.ts`

The private path is gitignored, so you can keep draft scripts, client-specific copy, unpublished tutorial notes, or proprietary prompts locally without publishing them. The public path is tracked and contains generic sample data for open-source users.

To customize the app for your own tutorial:

1. Copy `src/content/public/tutorialContent.ts` to `src/content/private/tutorialContent.ts`.
2. Replace `tutorialSegments` with your own recording plan.
3. Keep exporting `tutorialSegments: TutorialSegment[]`.
4. Optionally export supporting values like `tutorialOverview` or `youtubeChapters` for your own notes.

If no private file exists, the public sample content is used automatically.

## Tutorial Segment Shape

Each segment supports:

- `speak` blocks for narration.
- `list` blocks for show/action notes.
- `prompt` blocks for copyable AI prompts.
- `run` blocks for copyable terminal commands.
- `check` blocks for verification steps.
- `recordingNotes` and `editingNotes` for production reminders.

See `src/data/tutorial.ts` for the source types.

## Deployment

The Vite `base` path is configured as:

```ts
base: "/tutorial-video-companion/"
```

This is suitable for GitHub Pages-style deployments under a repository named `tutorial-video-companion`. If you deploy at a domain root or under a different path, update `base` in `vite.config.ts`.

## Package Metadata

Package metadata in `package.json` declares the MIT license, source repository, project homepage, and issue tracker:

- Repository: https://github.com/georgebutler/tutorial-video-companion
- Homepage: https://github.com/georgebutler/tutorial-video-companion#readme
- Issues: https://github.com/georgebutler/tutorial-video-companion/issues

## License

MIT. See `LICENSE`.
