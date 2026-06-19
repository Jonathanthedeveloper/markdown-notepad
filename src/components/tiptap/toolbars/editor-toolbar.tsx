import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ToolbarProvider } from "./toolbar-provider";
import { Editor } from "@tiptap/core";
import { UndoToolbar } from "./undo";
import { RedoToolbar } from "./redo";
import { HeadingsToolbar } from "./headings";
import { BlockquoteToolbar } from "./blockquote";
import { CodeToolbar } from "./code";
import { BoldToolbar } from "./bold";
import { ItalicToolbar } from "./italic";
import { UnderlineToolbar } from "./underline";
import { StrikeThroughToolbar } from "./strikethrough";
import { LinkToolbar } from "./link";
import { BulletListToolbar } from "./bullet-list";
import { OrderedListToolbar } from "./ordered-list";
import { HorizontalRuleToolbar } from "./horizontal-rule";
import { AlignmentToolbar } from "./alignment";
import { ImagePlaceholderToolbar } from "./image-placeholder-toolbar";
import { ColorHighlightToolbar } from "./color-and-highlight";
import { SearchAndReplaceToolbar } from "./search-and-replace-toolbar";
import { CodeBlockToolbar } from "./code-block";
import { MathToolbar } from "./math";
import { TaskListToolbar } from "./task-list";
import { TableToolbar } from "./table";
import { SubscriptToolbar } from "./subscript";
import { SuperscriptToolbar } from "./superscript";
import { EmojiPicker } from "./emoji-picker";
import { DetailsToolbar } from "./details";
import { CalloutToolbar } from "./callout";
import { FullscreenToggle } from "./fullscreen";
import { ReadingModeToggle } from "./reading-mode";
import { ShortcutsModal } from "./shortcuts-modal";
import { CodeWrapToggle } from "./code-wrap";
import { SourceView } from "./source-view";
import { Button } from "@/components/ui/button";
import { List, Minimize2 } from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  onToggleToc?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isReadingMode?: boolean;
  onToggleReadingMode?: () => void;
  isWrapping?: boolean;
  onToggleCodeWrap?: () => void;
  isSourceMode?: boolean;
  onToggleSource?: () => void;
  markdownSource?: string;
  onMarkdownChange?: (md: string) => void;
}

export const EditorToolbar = ({
  editor,
  onToggleToc,
  isFullscreen,
  onToggleFullscreen,
  isReadingMode,
  onToggleReadingMode,
  isWrapping,
  onToggleCodeWrap,
  isSourceMode,
  onToggleSource,
  markdownSource,
  onMarkdownChange,
}: EditorToolbarProps) => {
  if (isFullscreen) {
    return (
      <div className="fixed left-0 top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sm:block">
        <ToolbarProvider editor={editor}>
          <TooltipProvider>
            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-sm font-medium">Fullscreen Mode</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
                  <Minimize2 className="mr-1 h-4 w-4" />
                  Exit
                </Button>
              </div>
            </div>
          </TooltipProvider>
        </ToolbarProvider>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-20 w-full border-b bg-background hidden sm:block" role="toolbar" aria-label="Formatting toolbar" aria-orientation="horizontal">
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className="h-fit py-0.5">
            <div>
              <div className="flex items-center gap-1 px-2">
                {/* History Group */}
                <UndoToolbar />
                <RedoToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Text Structure Group */}
                <HeadingsToolbar />
                <BlockquoteToolbar />
                <CodeToolbar />
                <CodeBlockToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Basic Formatting Group */}
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                <StrikeThroughToolbar />
                <SubscriptToolbar />
                <SuperscriptToolbar />
                <LinkToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Lists & Structure Group */}
                <BulletListToolbar />
                <OrderedListToolbar />
                <TaskListToolbar />
                <DetailsToolbar />
                <CalloutToolbar />
                <HorizontalRuleToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Alignment Group */}
                <AlignmentToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Media & Styling Group */}
                <ImagePlaceholderToolbar />
                <TableToolbar />
                <ColorHighlightToolbar />
                <MathToolbar />
                <EmojiPicker />
                <Separator orientation="vertical" className="mx-1 h-7" />

                <div className="flex-1" />

                {/* Utility Group */}
                <SourceView
                  isSourceMode={!!isSourceMode}
                  onToggle={() => onToggleSource?.()}
                  markdown={markdownSource || ""}
                  onMarkdownChange={(md) => onMarkdownChange?.(md)}
                />
                <CodeWrapToggle isWrapping={!!isWrapping} onToggle={() => onToggleCodeWrap?.()} />
                <Tooltip>
                  <TooltipTrigger render={<Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    onClick={onToggleToc}
                  />}>
                    <List className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Table of Contents</span>
                  </TooltipContent>
                </Tooltip>
                <ReadingModeToggle isReadingMode={!!isReadingMode} onToggle={() => onToggleReadingMode?.()} />
                <FullscreenToggle isFullscreen={!!isFullscreen} onToggle={() => onToggleFullscreen?.()} />
                <ShortcutsModal />
                <SearchAndReplaceToolbar />
              </div>
            </div>
            <ScrollBar className="hidden" orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  );
};
