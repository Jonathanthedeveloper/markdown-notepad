import { Sigma } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const MathToolbar = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, onClick, children, ...props }, ref) => {
		const { editor } = useToolbar();
		return (
			<Tooltip>
				<TooltipTrigger render={<Button variant="ghost" size="icon" className={cn(
					"h-8 w-8 p-0 sm:h-9 sm:w-9",
					(className),
				)} onClick={(e) => {
					if (!editor) return;
					const { from, to } = editor.state.selection;
					const selectedText = editor.state.doc.textBetween(from, to);
					editor.chain().focus().insertInlineMath({ latex: selectedText || "" }).run();
					onClick?.(e);
				}} ref={ref} {...props} />}>{children ?? <Sigma className="h-4 w-4" />}</TooltipTrigger>
				<TooltipContent>
					<span>Math Formula</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

MathToolbar.displayName = "MathToolbar";

export { MathToolbar };
