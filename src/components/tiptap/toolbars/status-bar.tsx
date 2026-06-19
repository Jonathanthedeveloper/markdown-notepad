import { Editor } from "@tiptap/core";
import { useMemo } from "react";

interface StatusBarProps {
  editor: Editor;
  lastSaved: Date | null;
  isSaving: boolean;
}

export function StatusBar({ editor, lastSaved, isSaving }: StatusBarProps) {
  const stats = useMemo(() => {
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingTime };
  }, [editor.state.doc]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed bottom-0 left-0 z-10 hidden w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:block" role="status" aria-live="polite">
      <div className="flex h-8 items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{stats.words} words</span>
          <span>{stats.chars} characters</span>
          <span>~{stats.readingTime} min read</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isSaving
                  ? "bg-yellow-500 animate-pulse"
                  : lastSaved
                  ? "bg-green-500"
                  : "bg-muted-foreground/40"
              }`}
            />
            {isSaving
              ? "Saving..."
              : lastSaved
              ? `Saved at ${formatTime(lastSaved)}`
              : ""}
          </span>
          {editor.isActive("table") && <span>Table</span>}
        </div>
      </div>
    </div>
  );
}
