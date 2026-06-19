import { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface TocBottomSheetProps {
  editor: Editor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TocItem {
  id: string;
  level: number;
  textContent: string;
}

export function TocBottomSheet({ editor, open, onOpenChange }: TocBottomSheetProps) {
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Table of Contents</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4 pb-6">
          {items.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No headings found.</p>
          ) : (
            <nav className="flex flex-col">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const el = document.querySelector(`[data-toc-id="${item.id}"]`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    onOpenChange(false);
                  }}
                  className={cn(
                    "block w-full truncate py-2 text-left text-sm transition-colors hover:text-foreground",
                    item.level === 1 && "font-medium",
                    "text-muted-foreground",
                  )}
                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                >
                  {item.textContent}
                </button>
              ))}
            </nav>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
