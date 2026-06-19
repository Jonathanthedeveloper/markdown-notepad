import React from "react";
import { Download, Copy, FileText, Printer, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToolbar } from "./toolbar-provider";
import { cn } from "@/lib/utils";

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "-").slice(0, 80) || "note";
}

const ExportToolbar = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0] & { noteTitle?: string }>(
	({ className, noteTitle, ...props }, ref) => {
		const { editor } = useToolbar();
		const filename = sanitizeFilename(noteTitle || "note");

		const copyAsMarkdown = async () => {
			if (!editor) return;
			const md = editor.storage.markdown.manager.serialize(editor.getJSON());
			await navigator.clipboard.writeText(md);
		};

		const downloadMarkdown = () => {
			if (!editor) return;
			const md = editor.storage.markdown.manager.serialize(editor.getJSON());
			const blob = new Blob([md], { type: "text/markdown" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${filename}.md`;
			a.click();
			URL.revokeObjectURL(url);
		};

		const downloadHTML = () => {
			if (!editor) return;
			const html = editor.getHTML();
			const blob = new Blob([html], { type: "text/html" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${filename}.html`;
			a.click();
			URL.revokeObjectURL(url);
		};

		const printNote = () => {
			window.print();
		};

		const downloadPlainText = () => {
			if (!editor) return;
			const text = editor.getText();
			const blob = new Blob([text], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${filename}.txt`;
			a.click();
			URL.revokeObjectURL(url);
		};

		return (
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button variant="ghost" size="icon" className={cn(
					"h-8 w-8 p-0 sm:h-9 sm:w-9",
					className,
				)} ref={ref} {...props} />}>
					<Download className="h-4 w-4" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={copyAsMarkdown}>
						<Copy className="mr-2 h-4 w-4" />
						Copy as Markdown
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={downloadMarkdown}>
						<FileText className="mr-2 h-4 w-4" />
						Download .md
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={downloadHTML}>
						<Download className="mr-2 h-4 w-4" />
						Download .html
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={downloadPlainText}>
						<AlignLeft className="mr-2 h-4 w-4" />
						Download .txt
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={printNote}>
						<Printer className="mr-2 h-4 w-4" />
						Print / Save PDF
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
);

ExportToolbar.displayName = "ExportToolbar";

export { ExportToolbar };
