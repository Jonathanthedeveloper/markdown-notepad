import { ListCollapse } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const DetailsToolbar = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, onClick, children, ...props }, ref) => {
		const { editor } = useToolbar();
		return (
			<Tooltip>
				<TooltipTrigger render={<Button variant="ghost" size="icon" className={cn(
					"h-8 w-8 p-0 sm:h-9 sm:w-9",
					editor?.isActive("details") && "bg-accent",
					className,
				)} onClick={(e) => {
					editor?.chain().focus().insertContent({
						type: "details",
						attrs: { open: false },
						content: [
							{ type: "detailsSummary", content: [{ type: "text", text: "Click to expand" }] },
							{ type: "detailsContent", content: [{ type: "paragraph" }] },
						],
					}).run();
					onClick?.(e);
				}} ref={ref} {...props} />}>{children ?? <ListCollapse className="h-4 w-4" />}</TooltipTrigger>
				<TooltipContent>
					<span>Collapsible Section</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

DetailsToolbar.displayName = "DetailsToolbar";

export { DetailsToolbar };
