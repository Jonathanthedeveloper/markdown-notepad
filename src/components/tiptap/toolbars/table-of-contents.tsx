import { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TableOfContentsSidebarProps {
  editor: Editor;
}

interface TocItem {
  id: string;
  level: number;
  textContent: string;
  isActive: boolean;
  isScrolledOver: boolean;
}

export function TableOfContentsSidebar({ editor }: TableOfContentsSidebarProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const update = () => {
      const content = editor.storage.tableOfContents?.content || [];
      setItems(content);
    };

    update();

    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  if (items.length === 0) {
    return (
      <div className="h-full border-r bg-muted/30 p-4 sm:block">
        <p className="text-sm text-muted-foreground">No headings found.</p>
      </div>
    );
  }

  return (
      <div className="h-full border-r bg-muted/30 sm:block">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-semibold">Table of Contents</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <nav className="px-4 pb-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const el = document.querySelector(`[data-toc-id="${item.id}"]`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "block w-full truncate py-1 text-left text-sm transition-colors hover:text-foreground",
                item.level === 1 && "font-medium",
                item.isActive ? "text-foreground font-medium" : "text-muted-foreground",
              )}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              {item.textContent}
            </button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
