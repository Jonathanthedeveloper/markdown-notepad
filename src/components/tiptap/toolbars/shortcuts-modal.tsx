import React from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const shortcuts = [
	{ category: "Formatting", items: [
		{ keys: "Ctrl+B", action: "Bold" },
		{ keys: "Ctrl+I", action: "Italic" },
		{ keys: "Ctrl+U", action: "Underline" },
		{ keys: "Ctrl+Shift+S", action: "Strikethrough" },
		{ keys: "Ctrl+Shift+X", action: "Strikethrough (alt)" },
		{ keys: "Ctrl+\\", action: "Inline Code" },
	]},
	{ category: "Structure", items: [
		{ keys: "Ctrl+Shift+1-6", action: "Heading 1-6" },
		{ keys: "Ctrl+Shift+7", action: "Ordered List" },
		{ keys: "Ctrl+Shift+8", action: "Bullet List" },
		{ keys: "Ctrl+Shift+9", action: "Blockquote" },
	]},
	{ category: "History", items: [
		{ keys: "Ctrl+Z", action: "Undo" },
		{ keys: "Ctrl+Shift+Z", action: "Redo" },
	]},
	{ category: "Editor", items: [
		{ keys: "/", action: "Slash commands" },
		{ keys: "Ctrl+Shift+F", action: "Search & Replace" },
		{ keys: "Escape", action: "Exit fullscreen / Close menus" },
	]},
];

const ShortcutsModal = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, ...props }, ref) => {
		return (
			<Dialog>
				<DialogTrigger render={<Button variant="ghost" size="icon" className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)} ref={ref} {...props} />}>
					<Keyboard className="h-4 w-4" />
				</DialogTrigger>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Keyboard Shortcuts</DialogTitle>
					</DialogHeader>
					<div className="max-h-[60vh] overflow-y-auto space-y-4">
						{shortcuts.map((group) => (
							<div key={group.category}>
								<h3 className="mb-2 text-sm font-semibold text-muted-foreground">{group.category}</h3>
								<div className="space-y-1">
									{group.items.map((item) => (
										<div key={item.action} className="flex items-center justify-between py-1">
											<span className="text-sm">{item.action}</span>
											<kbd className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.keys}</kbd>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</DialogContent>
			</Dialog>
		);
	},
);

ShortcutsModal.displayName = "ShortcutsModal";

export { ShortcutsModal };
