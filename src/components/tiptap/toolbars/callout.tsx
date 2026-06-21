import React from "react";
import { Info, AlertTriangle, AlertCircle, Lightbulb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";
import type { CalloutType } from "../extensions/callout";

const CALLOUT_OPTIONS: { type: CalloutType; label: string; icon: React.ElementType }[] = [
  { type: "info", label: "Info", icon: Info },
  { type: "warning", label: "Warning", icon: AlertTriangle },
  { type: "danger", label: "Danger", icon: AlertCircle },
  { type: "tip", label: "Tip", icon: Lightbulb },
];

const CalloutToolbar = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
  ({ className, ...props }, ref) => {
    const { editor } = useToolbar();
    const isActive = editor?.isActive("callout");

    return (
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger render={
            <DropdownMenuTrigger render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 p-0 sm:h-9 sm:w-9",
                  isActive && "bg-accent",
                  className,
                )}
                disabled={!editor?.can().toggleCallout()}
                ref={ref}
                {...props}
              />
            } />
          }>
            <Info className="h-4 w-4" />
            <ChevronDown className="ml-0.5 h-3 w-3" />
          </TooltipTrigger>
          <TooltipContent>
            <span>Callout</span>
          </TooltipContent>
          <DropdownMenuContent align="start">
            {CALLOUT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.type}
                onClick={() => editor?.chain().focus().toggleCallout(opt.type).run()}
              >
                <opt.icon className="mr-2 h-4 w-4" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    );
  },
);

CalloutToolbar.displayName = "CalloutToolbar";

export { CalloutToolbar };
