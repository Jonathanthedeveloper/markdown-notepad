import React from "react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SourceViewProps {
  isSourceMode: boolean;
  onToggle: () => void;
  markdown: string;
  onMarkdownChange: (md: string) => void;
}

const SourceView = React.forwardRef<HTMLButtonElement, SourceViewProps & Parameters<typeof Button>[0]>(
  ({ isSourceMode, onToggle, className, markdown, onMarkdownChange, ...props }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 p-0 sm:h-9 sm:w-9",
              isSourceMode && "bg-accent",
              className,
            )}
            onClick={onToggle}
            ref={ref}
            {...props}
          />
        }>
          <Code2 className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>
          <span>{isSourceMode ? "Rich Text" : "Source Code"}</span>
        </TooltipContent>
      </Tooltip>
    );
  },
);

SourceView.displayName = "SourceView";

export { SourceView };
