import type { Editor } from "@tiptap/core";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToolbarProvider } from "./toolbar-provider";
import { BoldToolbar } from "./bold";
import { ItalicToolbar } from "./italic";
import { UnderlineToolbar } from "./underline";
import { StrikeThroughToolbar } from "./strikethrough";
import { CodeToolbar } from "./code";
import { SubscriptToolbar } from "./subscript";
import { SuperscriptToolbar } from "./superscript";
import { BlockquoteToolbar } from "./blockquote";
import { CodeBlockToolbar } from "./code-block";
import { BulletListToolbar } from "./bullet-list";
import { OrderedListToolbar } from "./ordered-list";
import { TaskListToolbar } from "./task-list";
import { DetailsToolbar } from "./details";
import { HorizontalRuleToolbar } from "./horizontal-rule";
import { LinkToolbar } from "./link";
import { ImagePlaceholderToolbar } from "./image-placeholder-toolbar";
import { TableToolbar } from "./table";
import { MathToolbar } from "./math";
import { EmojiPicker } from "./emoji-picker";
import { ColorHighlightToolbar } from "./color-and-highlight";
import { SourceView } from "./source-view";
import { CodeWrapToggle } from "./code-wrap";
import { FullscreenToggle } from "./fullscreen";
import { ReadingModeToggle } from "./reading-mode";
import { SearchAndReplaceToolbar } from "./search-and-replace-toolbar";
import { ExportToolbar } from "./export-toolbar";
import { ThemeToggle } from "./theme-toggle";
import { ShortcutsModal } from "./shortcuts-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToolbar } from "./toolbar-provider";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Info,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

interface MobileToolsDrawerProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isReadingMode: boolean;
  onToggleReadingMode: () => void;
  isWrapping: boolean;
  onToggleCodeWrap: () => void;
  isSourceMode: boolean;
  onToggleSource: () => void;
  onToggleToc: () => void;
  noteTitle: string;
  markdownSource: string;
  onMarkdownChange: (md: string) => void;
}

function ToolSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <h3 className="px-1 pb-1 text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function FlatHeadingButtons() {
  const { editor } = useToolbar();
  const levels = [1, 2, 3, 4, 5, 6] as const;
  const activeLevel = levels.find((level) => editor?.isActive("heading", { level }));

  return (
    <>
      <button
        onClick={() => editor?.chain().focus().setParagraph().run()}
        className={cn(
          "h-8 rounded-md px-2 text-sm transition-colors",
          !activeLevel ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent"
        )}
      >
        Normal
      </button>
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
          className={cn(
            "h-8 rounded-md px-2 text-sm font-medium transition-colors",
            activeLevel === level ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent"
          )}
        >
          H{level}
        </button>
      ))}
    </>
  );
}

function FlatAlignmentButtons() {
  const { editor } = useToolbar();

  const options = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
    { value: "justify", icon: AlignJustify },
  ] as const;

  return (
    <>
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => editor?.chain().focus().setTextAlign(value).run()}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            editor?.isActive({ textAlign: value })
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </>
  );
}

function FlatCalloutButtons() {
  const { editor } = useToolbar();

  const options = [
    { type: "info" as const, label: "Info", icon: Info },
    { type: "warning" as const, label: "Warning", icon: AlertTriangle },
    { type: "danger" as const, label: "Danger", icon: AlertCircle },
    { type: "tip" as const, label: "Tip", icon: Lightbulb },
  ];

  return (
    <>
      {options.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => editor?.chain().focus().toggleCallout(type).run()}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md px-2 text-sm transition-colors",
            editor?.isActive("callout", { calloutType: type })
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </>
  );
}

export function MobileToolsDrawer({
  editor,
  open,
  onOpenChange,
  isFullscreen,
  onToggleFullscreen,
  isReadingMode,
  onToggleReadingMode,
  isWrapping,
  onToggleCodeWrap,
  isSourceMode,
  onToggleSource,
  onToggleToc,
  noteTitle,
  markdownSource,
  onMarkdownChange,
}: MobileToolsDrawerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!isMobile) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle>Tools</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="h-[70vh] px-4 pb-6">
          <ToolbarProvider editor={editor}>
            <ToolSection title="Text">
              <BoldToolbar />
              <ItalicToolbar />
              <UnderlineToolbar />
              <StrikeThroughToolbar />
              <CodeToolbar />
              <SubscriptToolbar />
              <SuperscriptToolbar />
            </ToolSection>
            <Separator />

            <ToolSection title="Headings">
              <FlatHeadingButtons />
            </ToolSection>
            <Separator />

            <ToolSection title="Lists & Blocks">
              <BulletListToolbar />
              <OrderedListToolbar />
              <TaskListToolbar />
              <BlockquoteToolbar />
              <DetailsToolbar />
              <FlatCalloutButtons />
              <HorizontalRuleToolbar />
              <CodeBlockToolbar />
            </ToolSection>
            <Separator />

            <ToolSection title="Insert">
              <LinkToolbar />
              <ImagePlaceholderToolbar />
              <TableToolbar />
              <MathToolbar />
              <EmojiPicker />
            </ToolSection>
            <Separator />

            <ToolSection title="Alignment">
              <FlatAlignmentButtons />
            </ToolSection>
            <Separator />

            <ToolSection title="Color">
              <ColorHighlightToolbar />
            </ToolSection>
            <Separator />

            <ToolSection title="View">
              <SourceView
                isSourceMode={isSourceMode}
                onToggle={onToggleSource}
                markdown={markdownSource}
                onMarkdownChange={onMarkdownChange}
              />
              <CodeWrapToggle isWrapping={isWrapping} onToggle={onToggleCodeWrap} />
              <FullscreenToggle isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
              <ReadingModeToggle isReadingMode={isReadingMode} onToggle={onToggleReadingMode} />
              <button
                onClick={() => { onToggleToc(); onOpenChange(false); }}
                className="flex h-8 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent"
              >
                Table of Contents
              </button>
              <SearchAndReplaceToolbar />
            </ToolSection>
            <Separator />

            <ToolSection title="Export">
              <ExportToolbar noteTitle={noteTitle} />
            </ToolSection>
            <Separator />

            <div className="flex items-center gap-2 py-2">
              <ThemeToggle />
              <ShortcutsModal />
            </div>
          </ToolbarProvider>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
