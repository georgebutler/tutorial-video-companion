import { useEffect, useMemo, useState } from "react";
import {
  RecordingCompanion,
  TutorialSegmentCard,
  type TutorialProgressState,
} from "@/components/TutorialContent";
import { tutorialSegments } from "@tutorial-content";

const storageKey = "tutorial-video-companion-progress";
const legacyStorageKey = "webspatial-shop-recording-companion";
const emptyProgress: TutorialProgressState = { segments: {} };

function readProgressState(): TutorialProgressState {
  try {
    const saved = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);
    if (!saved) return emptyProgress;

    const parsed = JSON.parse(saved) as Partial<TutorialProgressState>;
    return {
      segments: parsed.segments ?? {},
    };
  } catch {
    return emptyProgress;
  }
}

function useTutorialProgress() {
  const [progress, setProgress] = useState<TutorialProgressState>(() => readProgressState());

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // Persistence is helpful, but the tutorial page should still work without storage.
    }
  }, [progress]);

  const toggleSegment = (id: string, checked: boolean) => {
    setProgress((current) => {
      if (current.segments[id] === checked) return current;
      return {
        ...current,
        segments: { ...current.segments, [id]: checked },
      };
    });
  };

  const resetProgress = () => {
    setProgress((current) => {
      if (Object.keys(current.segments).length === 0) {
        return current;
      }
      return { segments: {} };
    });
  };

  return { progress, resetProgress, toggleSegment };
}

export default function App() {
  const { progress, resetProgress, toggleSegment } = useTutorialProgress();
  const [activeSegmentId, setActiveSegmentId] = useState(tutorialSegments[0]?.id);

  const completedSegments = useMemo(
    () => tutorialSegments.filter((segment) => progress.segments[segment.id]).length,
    [progress.segments]
  );

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const segmentElements = tutorialSegments
      .map((segment) => document.getElementById(segment.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        let visible: IntersectionObserverEntry | undefined;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!visible || entry.intersectionRatio > visible.intersectionRatio) {
            visible = entry;
          }
        }

        const nextActiveId = visible?.target.id;
        if (nextActiveId) {
          setActiveSegmentId((current) => (current === nextActiveId ? current : nextActiveId));
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    segmentElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <main className="mx-auto grid w-full max-w-none grid-cols-1 items-start gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:px-8">
        <aside className="lg:self-start">
          <div className="lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
            <RecordingCompanion
              segments={tutorialSegments}
              progress={progress}
              activeSegmentId={activeSegmentId}
              completedSegments={completedSegments}
              totalSegments={tutorialSegments.length}
              onReset={resetProgress}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col gap-4" aria-label="Recording segments">
            {tutorialSegments.map((segment, index) => (
              <TutorialSegmentCard
                key={segment.id}
                segment={segment}
                isEven={index % 2 === 1}
                checked={Boolean(progress.segments[segment.id])}
                onToggleSegment={toggleSegment}
              />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
