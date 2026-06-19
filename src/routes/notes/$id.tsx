import "@/components/tiptap/tiptap.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";
import { EditorContent, useEditor } from "@tiptap/react";
import { TipTapFloatingMenu } from "@/components/tiptap/extensions/floating-menu";
import { FloatingToolbar } from "@/components/tiptap/extensions/floating-toolbar";
import { EditorToolbar } from "@/components/tiptap/toolbars/editor-toolbar";
import { MobileBottomBar } from "@/components/tiptap/toolbars/mobile-bottom-bar";
import { MobileToolsDrawer } from "@/components/tiptap/toolbars/mobile-tools-drawer";
import { EditorHeader } from "@/components/tiptap/toolbars/editor-header";
import { StatusBar } from "@/components/tiptap/toolbars/status-bar";
import { TableOfContentsSidebar } from "@/components/tiptap/toolbars/table-of-contents";
import { TocBottomSheet } from "@/components/tiptap/toolbars/toc-bottom-sheet";
import { createFileRoute } from '@tanstack/react-router';
import { useLiveQuery } from "@tanstack/react-db";
import { eq } from "@tanstack/db";
import { notesCollection } from "@/db";
import { useCallback, useEffect, useRef, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";

import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { ImageExtension } from "@/components/tiptap/extensions/image";
import { ImagePlaceholder } from "@/components/tiptap/extensions/image-placeholder";
import SearchAndReplace from "@/components/tiptap/extensions/search-and-replace";
import { PasteMarkdown } from "@/components/tiptap/extensions/paste-markdown";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Markdown } from "@tiptap/markdown";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import Emoji from "@tiptap/extension-emoji";
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import UniqueID from "@tiptap/extension-unique-id";
import { InvisibleCharacters } from "@tiptap/extension-invisible-characters";
import Focus from "@tiptap/extension-focus";
import { TableOfContents } from "@tiptap/extension-table-of-contents";
import { CodeBlockLowlightExt } from "@/components/tiptap/extensions/code-block-lowlight";
import { Callout } from "@/components/tiptap/extensions/callout";
import { ImageLightbox } from "@/components/tiptap/extensions/image-lightbox";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { GripVertical } from "lucide-react";
import { v7 as uuidV7 } from "uuid";
import { cn } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { useMediaQuery } from "@/hooks/use-media-query";

export const Route = createFileRoute('/notes/$id')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showToc, setShowToc] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const tocPanelRef = useRef<PanelImperativeHandle | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [markdownSource, setMarkdownSource] = useState("");

  const { data: note, isLoading } = useLiveQuery(
    (q) => q.from({ notes: notesCollection })
      .where(({ notes }) => eq(notes.id, id))
      .findOne()
  );

  const [title, setTitle] = useState(note?.title || "Untitled");

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const extensions = [
    StarterKit.configure({
      orderedList: { HTMLAttributes: { class: "list-decimal" } },
      bulletList: { HTMLAttributes: { class: "list-disc" } },
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      emptyNodeClass: "is-editor-empty",
      placeholder: ({ node }) => {
        switch (node.type.name) {
          case "heading": return `Heading ${node.attrs.level}`;
          case "codeBlock": return "";
          default: return "Write, type '/' for commands";
        }
      },
      includeChildren: false,
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle, Subscript, Superscript, Color,
    Highlight.configure({ multicolor: true }),
    ImageExtension, ImagePlaceholder, SearchAndReplace, Typography,
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
    Markdown.configure({}),
    PasteMarkdown,
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: true } }),
    Emoji,
    Details.configure({ persist: true }),
    DetailsContent,
    DetailsSummary,
    UniqueID.configure({
      types: ["heading", "paragraph"],
      generateID: () => uuidV7(),
    }),
    InvisibleCharacters.configure({ visible: false }),
    Focus.configure({
      className: "has-focus",
    }),
    TableOfContents,
    CodeBlockLowlightExt,
    Callout,
  ];

  const handleSave = useCallback((editor: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      const html = editor.getHTML();
      const firstHeading = editor.state.doc.content.content.find(
        (n: any) => n.type.name === "heading"
      );
      const title = firstHeading
        ? firstHeading.textContent
        : editor.state.doc.textContent.slice(0, 80) || "Untitled";

      notesCollection.update(id, (draft: any) => {
        draft.body = html;
        draft.title = title;
        draft.updatedAt = new Date();
      });
      setLastSaved(new Date());
      setIsSaving(false);
    }, 500);
  }, [id]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    notesCollection.update(id, (draft: any) => {
      draft.title = newTitle;
      draft.updatedAt = new Date();
    });
  }, [id]);

  const handleMarkdownChange = useCallback((md: string) => {
    setMarkdownSource(md);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editable: !isReadingMode,
    content: note?.body || "",
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (!isReadingMode) handleSave(editor);
    },
  });

  const handleToggleSource = useCallback(() => {
    if (!editor) return;
    if (!isSourceMode) {
      const md = editor.storage.markdown.manager.serialize(editor.getJSON());
      setMarkdownSource(md);
      setIsSourceMode(true);
    } else {
      editor.commands.setContent(markdownSource);
      setIsSourceMode(false);
    }
  }, [editor, isSourceMode, markdownSource]);

  useEffect(() => {
    if (editor && note && !editor.isDestroyed) {
      const currentContent = editor.getHTML();
      if (currentContent !== note.body && note.body) {
        editor.commands.setContent(note.body);
      }
    }
  }, [note?.body]);

  useEffect(() => {
    if (note?.title) setTitle(note.title);
  }, [note?.title]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isReadingMode);
    }
  }, [isReadingMode, editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!editor) return;
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, editor]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleToc = useCallback(() => {
    if (isMobile) {
      setTocOpen((prev) => !prev);
    } else {
      if (showToc) {
        tocPanelRef.current?.collapse();
      } else {
        tocPanelRef.current?.expand();
      }
    }
  }, [showToc, isMobile]);

  if (isLoading || !editor) return null;

  if (!note) {
    notesCollection.insert({
      id,
      title: "Untitled",
      body: "",
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return null;
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        <EditorHeader editor={editor} title={title} onTitleChange={handleTitleChange} />
        {isMobile ? (
          <MobileBottomBar editor={editor} onOpenTools={() => setToolsOpen(true)} />
        ) : (
          <EditorToolbar
            editor={editor}
            onToggleToc={handleToggleToc}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isReadingMode={isReadingMode}
            onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
            isWrapping={isWrapping}
            onToggleCodeWrap={() => setIsWrapping(!isWrapping)}
          />
        )}
        {isMobile ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-12">
            <EditorContent
              editor={editor}
              className={cn("min-h-full w-full cursor-text p-6", isWrapping && "code-wrap")}
            />
          </div>
        ) : (
          <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
            <ResizablePanel
              panelRef={tocPanelRef}
              defaultSize="20%"
              minSize="15%"
              maxSize="35%"
              collapsible

              onResize={() => {
                setShowToc(!tocPanelRef.current?.isCollapsed());
              }}
            >
              <TableOfContentsSidebar editor={editor} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="flex flex-col">
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <DragHandle editor={editor} className="tiptap-drag-handle">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </DragHandle>
                <EditorContent
                  editor={editor}
                  className={cn("min-h-full w-full cursor-text p-6", isWrapping && "code-wrap")}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
        <MobileToolsDrawer
          editor={editor}
          open={toolsOpen}
          onOpenChange={setToolsOpen}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isReadingMode={isReadingMode}
          onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
          isWrapping={isWrapping}
          onToggleCodeWrap={() => setIsWrapping(!isWrapping)}
          isSourceMode={isSourceMode}
          onToggleSource={handleToggleSource}
          onToggleToc={handleToggleToc}
          noteTitle={title}
          markdownSource={markdownSource}
          onMarkdownChange={handleMarkdownChange}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-dvh w-full flex-col border bg-card", isReadingMode && "reading-mode")}>
      <a
        href="#editor-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:bg-background focus:p-2 focus:outline-none"
      >
        Skip to editor
      </a>
      <EditorHeader editor={editor} title={title} onTitleChange={handleTitleChange} />
      <EditorToolbar
        editor={editor}
        onToggleToc={handleToggleToc}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        isReadingMode={isReadingMode}
        onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
        isWrapping={isWrapping}
        onToggleCodeWrap={() => setIsWrapping(!isWrapping)}
        isSourceMode={isSourceMode}
        onToggleSource={handleToggleSource}
        markdownSource={markdownSource}
        onMarkdownChange={handleMarkdownChange}
      />
      {isMobile && <MobileBottomBar editor={editor} onOpenTools={() => setToolsOpen(true)} />}
      {!isReadingMode && <TipTapFloatingMenu editor={editor} />}
      {!isReadingMode && <FloatingToolbar editor={editor} />}
      {isMobile ? (
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-12">
          {!isReadingMode && (
            <DragHandle editor={editor} className="tiptap-drag-handle">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </DragHandle>
          )}
          {isSourceMode ? (
            <textarea
              value={markdownSource}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              id="editor-content"
              className="h-full w-full resize-none bg-background p-6 font-mono text-sm outline-none"
              spellCheck={false}
            />
          ) : (
            <EditorContent
              editor={editor}
              id="editor-content"
              className={cn("h-full w-full cursor-text p-4 sm:p-6", isWrapping && "code-wrap")}
            />
          )}
        </div>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
          <ResizablePanel
            panelRef={tocPanelRef}
            defaultSize="20%"
            minSize="15%"
            maxSize="35%"
            collapsible

            onResize={() => {
              setShowToc(!tocPanelRef.current?.isCollapsed());
            }}
          >
            <TableOfContentsSidebar editor={editor} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="flex flex-col">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {!isReadingMode && (
                <DragHandle editor={editor} className="tiptap-drag-handle">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </DragHandle>
              )}
              {isSourceMode ? (
                <textarea
                  value={markdownSource}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  id="editor-content"
                  className="h-full w-full resize-none bg-background p-6 font-mono text-sm outline-none"
                  spellCheck={false}
                />
              ) : (
                <EditorContent
                  editor={editor}
                  id="editor-content"
                  className={cn("h-full w-full cursor-text sm:p-6", isWrapping && "code-wrap")}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
      <StatusBar editor={editor} lastSaved={lastSaved} isSaving={isSaving} />
      <TocBottomSheet editor={editor} open={tocOpen} onOpenChange={setTocOpen} />
      <MobileToolsDrawer
        editor={editor}
        open={toolsOpen}
        onOpenChange={setToolsOpen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        isReadingMode={isReadingMode}
        onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
        isWrapping={isWrapping}
        onToggleCodeWrap={() => setIsWrapping(!isWrapping)}
        isSourceMode={isSourceMode}
        onToggleSource={handleToggleSource}
        onToggleToc={handleToggleToc}
        noteTitle={title}
        markdownSource={markdownSource}
        onMarkdownChange={handleMarkdownChange}
      />
      <ImageLightbox />
    </div>
  )
}
