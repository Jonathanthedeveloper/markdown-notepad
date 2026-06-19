import { Subscript as SubscriptIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const SubscriptToolbar = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, onClick, children, ...props }, ref) => {
		const { editor } = useToolbar();
		return (
			<Tooltip>
				<TooltipTrigger render={<Button variant="ghost" size="icon" className={cn(
					"h-8 w-8 p-0 sm:h-9 sm:w-9",
					editor?.isActive("subscript") && "bg-accent",
					className,
				)} onClick={(e) => {
					editor?.chain().focus().toggleSubscript().run();
					onClick?.(e);
				}} disabled={!editor?.can().chain().focus().toggleSubscript().run()} ref={ref} {...props} />}>{children ?? <SubscriptIcon className="h-4 w-4" />}</TooltipTrigger>
				<TooltipContent>
					<span>Subscript</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

SubscriptToolbar.displayName = "SubscriptToolbar";

export { SubscriptToolbar };
