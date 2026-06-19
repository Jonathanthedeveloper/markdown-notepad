import type { Editor } from "@tiptap/core";
import { Bold, Italic, Underline, Undo2, Redo2, Heading2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  editor: Editor;
  onOpenTools: () => void;
}

const headingLevels = [1, 2, 3] as const;

export function MobileBottomBar({ editor, onOpenTools }: MobileBottomBarProps) {
  const activeHeadingLevel = headingLevels.find((level) =>
    editor.isActive("heading", { level })
  );

  const cycleHeading = () => {
    if (activeHeadingLevel === 1) {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (activeHeadingLevel === 2) {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (activeHeadingLevel === 3) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 z-30 w-full border-t bg-background sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            editor.isActive("bold")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Bold className="h-5 w-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            editor.isActive("italic")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Italic className="h-5 w-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            editor.isActive("underline")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Underline className="h-5 w-5" />
        </button>

        <button
          onClick={cycleHeading}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            activeHeadingLevel
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          {activeHeadingLevel ? (
            <span className="text-sm font-bold">H{activeHeadingLevel}</span>
          ) : (
            <Heading2 className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent disabled:opacity-40"
        >
          <Undo2 className="h-5 w-5" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent disabled:opacity-40"
        >
          <Redo2 className="h-5 w-5" />
        </button>

        <button
          onClick={onOpenTools}
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
