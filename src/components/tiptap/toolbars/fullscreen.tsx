import React from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

const FullscreenToggle = React.forwardRef<HTMLButtonElement, FullscreenToggleProps & Parameters<typeof Button>[0]>(
	({ isFullscreen, onToggle, className, ...props }, ref) => {
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
					{isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
				</TooltipTrigger>
				<TooltipContent>
					<span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

FullscreenToggle.displayName = "FullscreenToggle";

export { FullscreenToggle };
