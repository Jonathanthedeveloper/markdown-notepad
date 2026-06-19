import { FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ExportToolbar } from "./export-toolbar";
import { ToolbarProvider } from "./toolbar-provider";
import type { Editor } from "@tiptap/core";
import { useCallback, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

interface EditorHeaderProps {
  editor: Editor;
  title: string;
  onTitleChange: (title: string) => void;
}

export function EditorHeader({ editor, title, onTitleChange }: EditorHeaderProps) {
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setEditValue(title);
    }
  }, [editValue, title, onTitleChange]);

  const handleBlur = () => commit();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setEditValue(title);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-2 h-12">
      <Link to="/notes" className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <span className="hidden text-sm font-semibold sm:inline">Markdown Notepad</span>
      </Link>

      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Untitled"
        aria-label="Note title"
        className="min-w-0 flex-1 truncate border-none bg-transparent px-4 text-center text-sm font-medium outline-none ring-0 focus:ring-0 focus:outline-none"
      />

      <div className="hidden items-center gap-1 sm:flex">
        <ToolbarProvider editor={editor}>
          <ExportToolbar noteTitle={title} />
        </ToolbarProvider>
        <ThemeToggle />
      </div>
    </div>
  );
}
