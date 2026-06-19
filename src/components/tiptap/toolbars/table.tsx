import { Table as TableIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const TableToolbar = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, onClick, children, ...props }, ref) => {
		const { editor } = useToolbar();
		return (
			<Tooltip>
				<TooltipTrigger render={<Button variant="ghost" size="icon" className={cn(
					"h-8 w-8 p-0 sm:h-9 sm:w-9",
					editor?.isActive("table") && "bg-accent",
					className,
				)} onClick={(e) => {
					editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
					onClick?.(e);
				}} disabled={!editor?.can().chain().focus().insertTable().run()} ref={ref} {...props} />}>{children ?? <TableIcon className="h-4 w-4" />}</TooltipTrigger>
				<TooltipContent>
					<span>Insert Table</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

TableToolbar.displayName = "TableToolbar";

export { TableToolbar };
