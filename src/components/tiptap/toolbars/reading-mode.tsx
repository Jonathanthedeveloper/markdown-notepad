import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ReadingModeToggleProps {
  isReadingMode: boolean;
  onToggle: () => void;
}

const ReadingModeToggle = React.forwardRef<HTMLButtonElement, ReadingModeToggleProps & Parameters<typeof Button>[0]>(
	({ isReadingMode, onToggle, className, ...props }, ref) => {
		return (
			<Tooltip>
				<TooltipTrigger render={<Button
					variant="ghost"
					size="icon"
					className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)}
					onClick={onToggle}
					ref={ref}
					{...props}
				/>}>
					{isReadingMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</TooltipTrigger>
				<TooltipContent>
					<span>{isReadingMode ? "Exit Reading Mode" : "Reading Mode"}</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

ReadingModeToggle.displayName = "ReadingModeToggle";

export { ReadingModeToggle };
