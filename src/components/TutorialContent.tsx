import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AudioLines,
  CheckCircle2,
  ClipboardPaste,
  Lightbulb,
  MonitorPlay,
  Scissors,
  Terminal,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  TutorialAudience,
  TutorialBlock,
  TutorialCue,
  TutorialSegment,
} from "@/data/tutorial";

export type TutorialProgressState = {
  segments: Record<string, boolean>;
};

type CueConfig = {
  label: string;
  icon: LucideIcon;
  className: string;
  blockClassName: string;
};

type BlockBadgeType = TutorialCue | "show";

const inlineCodePattern =
  /(<[A-Z][^>]*>|@[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+|\bnpm run [A-Za-z0-9:_-]+\b|\brunInSpatialWeb\(\)|\b(?:requestAnimationFrame|entityTransform|DOMMatrix|Model3D|ModelRef|enable-xr|xr_main_scene|avp|dev|build|preview)\b|\b(?:\.{1,2}\/|~\/|\/|[A-Za-z0-9_-]+\/)[A-Za-z0-9_./-]*[A-Za-z0-9_-]\.[A-Za-z0-9][A-Za-z0-9_-]*\b)/g;

const cueConfig: Record<TutorialCue, CueConfig> = {
  speak: {
    label: "SAY",
    icon: AudioLines,
    className: "border-rose-600/30 bg-rose-50 text-rose-800",
    blockClassName: "border-l-rose-500",
  },
  cue: {
    label: "NOTE",
    icon: Lightbulb,
    className: "border-amber-600/30 bg-amber-50 text-amber-800",
    blockClassName: "border-l-amber-500",
  },
  prompt: {
    label: "PASTE",
    icon: ClipboardPaste,
    className: "border-violet-600/30 bg-violet-50 text-violet-800",
    blockClassName: "border-l-violet-500",
  },
  run: {
    label: "RUN",
    icon: Terminal,
    className: "border-slate-600/30 bg-slate-50 text-slate-800",
    blockClassName: "border-l-slate-500",
  },
  check: {
    label: "VERIFY",
    icon: CheckCircle2,
    className: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
    blockClassName: "border-l-emerald-500",
  },
};

const blockBadgeConfig: Record<BlockBadgeType, CueConfig> = {
  ...cueConfig,
  show: {
    label: "SHOW",
    icon: MonitorPlay,
    className: "border-cyan-600/30 bg-cyan-50 text-cyan-800",
    blockClassName: "border-l-cyan-500",
  },
};

function getBlockBadgeType(block: TutorialBlock): BlockBadgeType | undefined {
  if (block.type === "list") return block.title === "Show" ? "show" : undefined;

  return block.type;
}

type BlockAudience = TutorialAudience | "recording-note";

function getBlockAudience(block: TutorialBlock): BlockAudience {
  if (block.audience) return block.audience;
  if (block.type === "cue") return "recording-note";
  if (block.type === "speak") return "dialogue";
  return "visual";
}

function getBlockNoteItems(block: TutorialBlock): string[] {
  if ("paragraphs" in block) return block.paragraphs;
  if ("items" in block) return block.items;
  return [block.code];
}

function renderTextWithInlineCode(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlineCodePattern)) {
    const code = match[0];
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, startIndex));
    }

    parts.push(
      <code
        key={`${code}-${startIndex}`}
        className="bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
      >
        {code}
      </code>
    );

    lastIndex = startIndex + code.length;
  }

  if (lastIndex === 0) return text;

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function CueBadge({ type }: { type: BlockBadgeType }) {
  const config = blockBadgeConfig[type];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 w-20 justify-center gap-1.5 text-[0.7rem] font-semibold tracking-wide shadow-none",
        config.className
      )}
      aria-label={config.label}
    >
      <Icon data-icon="inline-start" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}

function TextList({
  items,
  className,
  indented = true,
}: {
  items: string[];
  className?: string;
  indented?: boolean;
}) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-2 text-sm leading-6 text-card-foreground marker:text-muted-foreground",
        indented ? "pl-5" : "list-inside pl-0",
        className
      )}
    >
      {items.map((item) => (
        <li key={item} className="break-words">
          {renderTextWithInlineCode(item)}
        </li>
      ))}
    </ul>
  );
}

type CodeBlockLabel = "Prompt" | "Command";

function CodeBlock({ code, label }: { code: string; label: CodeBlockLabel }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(resetTimerRef.current);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      setCopied(false);
      console.warn(`Unable to copy ${label.toLowerCase()}`, error);
    }
  }

  return (
    <div className="overflow-hidden rounded-sm border border-slate-800 bg-slate-950 text-slate-50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
          {label}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-slate-600 bg-slate-900 text-slate-50 shadow-none hover:bg-slate-800 hover:text-white"
          onClick={handleCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-56 overflow-auto p-3 text-xs leading-6 text-slate-50 sm:text-sm">
        <code className="block whitespace-pre font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function TutorialBlockCard({
  block,
  emphasis = "standard",
}: {
  block: TutorialBlock;
  emphasis?: "dialogue" | "standard";
}) {
  const badgeType = getBlockBadgeType(block);
  const isDialogue = emphasis === "dialogue";

  return (
    <section
      className={cn(
        "border-l-2 py-2.5 pl-3",
        badgeType ? blockBadgeConfig[badgeType].blockClassName : "border-l-border"
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {badgeType ? <CueBadge type={badgeType} /> : null}
        {!badgeType ? (
          <h3 className="text-[13px] font-medium leading-5 text-muted-foreground">{block.title}</h3>
        ) : null}
      </div>
      {"paragraphs" in block ? (
        <div
          className={cn(
            "flex flex-col gap-2",
            isDialogue
              ? "text-[13px] leading-5 text-foreground"
              : "text-sm leading-6 text-card-foreground"
          )}
        >
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph} className="break-words">
              “{renderTextWithInlineCode(paragraph)}”
            </p>
          ))}
        </div>
      ) : "code" in block ? (
        <CodeBlock code={block.code} label={block.type === "prompt" ? "Prompt" : "Command"} />
      ) : (
        <TextList
          items={block.items}
          indented={isDialogue}
          className={isDialogue ? "text-sm leading-6" : "text-[13px] leading-5"}
        />
      )}
    </section>
  );
}

function ScriptColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="border-b pb-2">
        <h3 className="text-xs font-medium uppercase leading-5 tracking-[0.14em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </section>
  );
}

function NotesPanel({
  title,
  icon: Icon,
  items,
  className,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  className: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className={cn("border-l-2 pl-3", className)}>
      <div className="mb-2">
        <h3 className="flex items-center gap-2 text-xs font-medium uppercase leading-5 tracking-[0.14em] text-muted-foreground">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </h3>
      </div>
      <TextList items={items} indented={false} className="text-[13px] leading-5" />
    </section>
  );
}

function ProductionNotes({
  recordingNotes,
  editingNotes,
}: {
  recordingNotes: string[];
  editingNotes: string[];
}) {
  if (recordingNotes.length === 0 && editingNotes.length === 0) return null;

  return (
    <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
      <NotesPanel
        title="Recording notes"
        icon={Video}
        items={recordingNotes}
        className="border-l-amber-500"
      />
      <NotesPanel
        title="Editing notes"
        icon={Scissors}
        items={editingNotes}
        className="border-l-sky-500"
      />
    </div>
  );
}

export function TutorialSegmentCard({
  segment,
  isEven,
  checked,
  onToggleSegment,
}: {
  segment: TutorialSegment;
  isEven: boolean;
  checked: boolean;
  onToggleSegment: (id: string, checked: boolean) => void;
}) {
  const { dialogueBlocks, recordingNotes, visualBlocks } = useMemo(() => {
    const dialogue: TutorialBlock[] = [];
    const visual: TutorialBlock[] = [];
    const notes: string[] = [...(segment.recordingNotes ?? [])];

    for (const block of segment.blocks) {
      const audience = getBlockAudience(block);

      if (audience === "dialogue") {
        dialogue.push(block);
      } else if (audience === "visual") {
        visual.push(block);
      } else {
        notes.push(...getBlockNoteItems(block));
      }
    }

    return { dialogueBlocks: dialogue, recordingNotes: notes, visualBlocks: visual };
  }, [segment]);

  return (
    <Card
      id={segment.id}
      className={cn(
        "scroll-mt-4 shadow-none sm:scroll-mt-6",
        isEven && "bg-muted/45",
        segment.priority === "key" && "border-primary",
        segment.priority === "optional" && "border-dashed"
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="tabular-nums shadow-none">
                {segment.timeRange}
              </Badge>
              {segment.priority === "optional" ? (
                <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700 shadow-none">
                  Optional — skip if long
                </Badge>
              ) : null}
            </div>
            <h2 className="break-words text-2xl font-semibold leading-tight tracking-tight sm:text-[1.625rem]">
              {segment.title}
            </h2>
          </div>
          <label className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm border bg-background px-3 text-sm font-medium shadow-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => onToggleSegment(segment.id, event.target.checked)}
            />
            Recorded
          </label>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-5 xl:grid-cols-2">
          <ScriptColumn
            title="Dialogue / Speech"
          >
            {dialogueBlocks.map((block) => (
              <TutorialBlockCard
                key={`${segment.id}-${block.title}-${block.type}`}
                block={block}
                emphasis="dialogue"
              />
            ))}
          </ScriptColumn>
          <ScriptColumn
            title="Visuals / Recorded Actions"
          >
            {visualBlocks.map((block) => (
              <TutorialBlockCard key={`${segment.id}-${block.title}-${block.type}`} block={block} />
            ))}
          </ScriptColumn>
        </div>

        <ProductionNotes
          recordingNotes={recordingNotes}
          editingNotes={segment.editingNotes ?? []}
        />
      </CardContent>
    </Card>
  );
}

export function RecordingCompanion({
  segments,
  progress,
  activeSegmentId,
  completedSegments,
  totalSegments,
  onReset,
}: {
  segments: TutorialSegment[];
  progress: TutorialProgressState;
  activeSegmentId?: string;
  completedSegments: number;
  totalSegments: number;
  onReset: () => void;
}) {
  const progressPercent =
    totalSegments === 0 ? 0 : Math.round((completedSegments / totalSegments) * 100);
  const foundActiveIndex = segments.findIndex((segment) => segment.id === activeSegmentId);
  const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;
  const activeSegment = segments[activeIndex];

  return (
    <Card size="sm" className="border-border/80 bg-card/95 shadow-none">
      <CardHeader className="gap-1 border-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Recording Companion</CardTitle>
            <CardDescription>
              {completedSegments} of {totalSegments} complete
            </CardDescription>
          </div>
          <span className="shrink-0 rounded-sm border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {progressPercent}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          role="progressbar"
          aria-label="Recording progress"
          aria-valuemin={0}
          aria-valuemax={totalSegments}
          aria-valuenow={completedSegments}
          className="h-1.5 overflow-hidden rounded-sm bg-secondary"
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {activeSegment ? (
          <section className="rounded-sm border bg-muted/40 p-3" aria-labelledby="active-segment-title">
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              Now recording
            </p>
            <h2 id="active-segment-title" className="mt-1 text-sm font-semibold leading-snug">
              {activeIndex + 1}. {activeSegment.title}
            </h2>
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              {activeSegment.timeRange}
            </p>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">{activeSegment.goal}</p>
          </section>
        ) : null}
        <nav className="flex flex-col gap-1" aria-label="Recording segments">
          {segments.map((segment, index) => {
            const isComplete = Boolean(progress.segments[segment.id]);
            const isActive = activeSegmentId === segment.id;

            return (
              <Button
                key={segment.id}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "h-auto min-h-10 justify-start whitespace-normal border px-2.5 py-2 text-left shadow-none",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-transparent",
                  isComplete && !isActive && "text-primary"
                )}
                onClick={() => {
                  const prefersReducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches;
                  document.getElementById(segment.id)?.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start",
                  });
                }}
              >
                <span className="flex min-w-0 items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border text-[0.65rem] leading-none",
                      isComplete
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="text-[0.7rem] tabular-nums text-muted-foreground">
                      {segment.timeRange}
                    </span>
                    <span className="text-sm leading-snug">{segment.title}</span>
                  </span>
                </span>
              </Button>
            );
          })}
        </nav>
        <Separator />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-start px-0 text-muted-foreground shadow-none hover:text-foreground"
          onClick={onReset}
        >
          Reset progress
        </Button>
      </CardContent>
    </Card>
  );
}
