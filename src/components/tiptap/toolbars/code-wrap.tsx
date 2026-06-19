import React from "react";
import { WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CodeWrapToggleProps {
  isWrapping: boolean;
  onToggle: () => void;
}

const CodeWrapToggle = React.forwardRef<HTMLButtonElement, CodeWrapToggleProps & Parameters<typeof Button>[0]>(
	({ isWrapping, onToggle, className, ...props }, ref) => {
		return (
			<Tooltip>
				<TooltipTrigger render={<Button
					variant="ghost"
					size="icon"
					className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", isWrapping && "bg-accent", className)}
					onClick={onToggle}
					ref={ref}
					{...props}
				/>}>
					<WrapText className="h-4 w-4" />
				</TooltipTrigger>
				<TooltipContent>
					<span>{isWrapping ? "Disable" : "Enable"} Word Wrap</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

CodeWrapToggle.displayName = "CodeWrapToggle";

export { CodeWrapToggle };
