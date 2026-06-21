import React from "react";
import { Download, Copy, FileText, Printer, AlignLeft, FileIcon } from "lucide-react";
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

function downloadBlob(blob: Blob, name: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
	const base64 = dataUrl.split(",")[1] ?? "";
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function dataUrlToMime(dataUrl: string): string {
	const match = dataUrl.match(/^data:([^;]+);/);
	return match?.[1] ?? "image/png";
}

function mathmlToDocx(mathmlStr: string, docxModules: any): any {
	const { Math, MathRun, MathFraction, MathSuperScript, MathSubScript, MathSubSuperScript, MathRadical, MathRoundBrackets } = docxModules;
	const parser = new DOMParser();
	const doc = parser.parseFromString(mathmlStr, "text/xml");
	const root = doc.querySelector("math > m\\:oMath, math > oMath") ?? doc.querySelector("math")?.firstElementChild;
	if (!root) return new Math({ children: [new MathRun("")] });

	function walk(el: Element | null): any[] {
		if (!el) return [];
		const tag = el.localName?.toLowerCase() ?? el.tagName.toLowerCase().replace("m:", "").replace("m4jax:", "");

		switch (tag) {
			case "mi":
			case "mn":
			case "mo":
			case "mtext":
			case "ms":
				return [new MathRun({ text: el.textContent ?? "" })];
			case "mfrac": {
				const children = Array.from(el.children);
				const num = children[0]?.localName === "m:num" ? Array.from(children[0].children) : [children[0]];
				const den = children[1]?.localName === "m:den" ? Array.from(children[1].children) : [children[1]];
				const numRuns = num.flatMap((c) => walk(c));
				const denRuns = den.flatMap((c) => walk(c));
				return [new MathFraction({ numerator: numRuns.length ? numRuns : [new MathRun("")], denominator: denRuns.length ? denRuns : [new MathRun("")] })];
			}
			case "msup": {
				const children = Array.from(el.children);
				const base = walk(children[0]);
				const sup = walk(children[1]);
				return [new MathSuperScript({ base: base.length ? base : [new MathRun("")], superscript: sup.length ? sup : [new MathRun("")] })];
			}
			case "msub": {
				const children = Array.from(el.children);
				const base = walk(children[0]);
				const sub = walk(children[1]);
				return [new MathSubScript({ base: base.length ? base : [new MathRun("")], subscript: sub.length ? sub : [new MathRun("")] })];
			}
			case "msubsup": {
				const children = Array.from(el.children);
				const base = walk(children[0]);
				const sub = walk(children[1]);
				const sup = walk(children[2]);
				return [new MathSubSuperScript({ base: base.length ? base : [new MathRun("")], subscript: sub.length ? sub : [new MathRun("")], superscript: sup.length ? sup : [new MathRun("")] })];
			}
			case "msqrt":
			case "mroot": {
				const children = Array.from(el.children);
				const content = walk(children[0]);
				if (tag === "mroot" && children[1]) {
					const degree = walk(children[1]);
					return [new MathRadical({ base: content.length ? content : [new MathRun("")], degree: degree.length ? degree : undefined })];
				}
				return [new MathRadical({ base: content.length ? content : [new MathRun("")] })];
			}
			case "mfenced": {
				const inner = Array.from(el.children).flatMap((c) => walk(c));
				return [new MathRoundBrackets({ children: inner.length ? inner : [new MathRun("")] })];
			}
			case "mrow":
			case "mstyle":
			case "mpadded":
			case "mphantom":
			case "semantics":
			case "annotation":
				return Array.from(el.children).flatMap((c) => walk(c));
			case "munder":
			case "mover":
			case "munderover": {
				const children = Array.from(el.children);
				const base = walk(children[0]);
				const accent = children[1] ? walk(children[1]) : [];
				const bottom = children[2] ? walk(children[2]) : [];
				const allRuns = [...base, ...accent, ...bottom];
				return allRuns.length ? allRuns : [new MathRun("")];
			}
			case "mnary": {
				const accentChar = el.getAttribute("accent") ?? el.getAttribute("m:movementdictionary") ?? "\u2211";
				const children = Array.from(el.children);
				const inner = children.flatMap((c) => walk(c));
				return inner.length ? inner : [new MathRun(accentChar)];
			}
			case "mtable":
			case "mtr":
			case "mtd": {
				const inner = Array.from(el.children).flatMap((c) => walk(c));
				return inner.length ? inner : [new MathRun("")];
			}
			case "none":
				return [];
			default: {
				const inner = Array.from(el.children).flatMap((c) => walk(c));
				return inner.length ? inner : [new MathRun(el.textContent ?? "")];
			}
		}
	}

	const result = walk(root);
	return new Math({ children: result.length ? result : [new MathRun("")] });
}

function textAlignToAlignment(textAlign: string | undefined, AlignmentType: any): any {
	switch (textAlign) {
		case "center": return AlignmentType.CENTER;
		case "right": return AlignmentType.END;
		case "justify": return AlignmentType.JUSTIFIED;
		default: return AlignmentType.START;
	}
}

async function buildDocx(editor: any) {
	const docxModules = await import("docx");
	const {
		Document, Paragraph, TextRun, HeadingLevel,
		ExternalHyperlink, ImageRun, Table, TableRow, TableCell,
		WidthType, AlignmentType, BorderStyle, convertInchesToTwip,
	} = docxModules;

	function textRuns(node: any): any[] {
		const marks = node.marks ?? [];

		if (!marks.length) {
			return [new TextRun({ text: node.text ?? "" })];
		}

		const bold = marks.some((m: any) => m.type === "bold");
		const italic = marks.some((m: any) => m.type === "italic");
		const underline = marks.some((m: any) => m.type === "underline");
		const strike = marks.some((m: any) => m.type === "strike");
		const code = marks.some((m: any) => m.type === "code");
		const link = marks.find((m: any) => m.type === "link");
		const subscript = marks.some((m: any) => m.type === "subscript");
		const superscript = marks.some((m: any) => m.type === "superscript");
		const highlight = marks.find((m: any) => m.type === "highlight");
		const textStyle = marks.find((m: any) => m.type === "textStyle");
		const color = textStyle?.attrs?.color;

		const runProps: any = {
			text: node.text ?? "",
			bold,
			italics: italic,
			underline: underline ? {} : undefined,
			strike,
			subScript: subscript || undefined,
			superScript: superscript || undefined,
			font: code ? "Courier New" : undefined,
			size: code ? 20 : undefined,
			color: color || undefined,
		};

		if (highlight) {
			runProps.shading = { fill: highlight.attrs?.color || "FFFF00", color: "auto" };
		}

		if (link) {
			return [new ExternalHyperlink({ children: [new TextRun({ ...runProps, style: "Hyperlink" })], link: link.attrs?.href ?? "" })];
		}
		return [new TextRun(runProps)];
	}

	function processNodes(nodes: any[]): any[] {
		const children: any[] = [];
		for (const node of nodes ?? []) {
			switch (node.type) {
				case "heading": {
					const level = node.attrs?.level ?? 1;
					const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
						1: HeadingLevel.HEADING_1,
						2: HeadingLevel.HEADING_2,
						3: HeadingLevel.HEADING_3,
						4: HeadingLevel.HEADING_4,
						5: HeadingLevel.HEADING_5,
						6: HeadingLevel.HEADING_6,
					};
					const alignment = textAlignToAlignment(node.attrs?.textAlign, AlignmentType);
					children.push(new Paragraph({
						heading: headingMap[level] ?? HeadingLevel.HEADING_1,
						alignment,
						children: (node.content ?? []).flatMap((n: any) => textRuns(n)),
					}));
					break;
				}
				case "paragraph": {
					const alignment = textAlignToAlignment(node.attrs?.textAlign, AlignmentType);
					const paraChildren: any[] = [];
					for (const child of node.content ?? []) {
						if (child.type === "hardBreak") {
							paraChildren.push(new TextRun({ break: 1 }));
						} else {
							paraChildren.push(...textRuns(child));
						}
					}
					children.push(new Paragraph({ alignment, children: paraChildren }));
					break;
				}
				case "bulletList":
					children.push(...(node.content ?? []).flatMap((li: any) => processListItem(li, false)));
					break;
				case "orderedList":
					children.push(...(node.content ?? []).flatMap((li: any) => processListItem(li, true)));
					break;
				case "taskList":
					children.push(...(node.content ?? []).flatMap((li: any) => {
						const checked = li.attrs?.checked ?? false;
						const inner = li.content?.[0]?.content ?? [];
						const runs: any[] = [];
						runs.push(new TextRun({ text: checked ? "\u2611 " : "\u2610 " }));
						for (const child of inner) {
							if (child.type === "hardBreak") {
								runs.push(new TextRun({ break: 1 }));
							} else {
								runs.push(...textRuns(child));
							}
						}
						return [new Paragraph({ children: runs })];
					}));
					break;
				case "blockquote": {
					const paraChildren: any[] = [];
					for (const block of node.content ?? []) {
						for (const child of block.content ?? []) {
							if (child.type === "hardBreak") {
								paraChildren.push(new TextRun({ break: 1 }));
							} else {
								paraChildren.push(...textRuns(child));
							}
						}
					}
					children.push(new Paragraph({ indent: { left: convertInchesToTwip(0.5) }, children: paraChildren }));
					break;
				}
				case "codeBlock": {
					const lang = node.attrs?.language ?? "";
					const codeText = (node.content ?? []).map((n: any) => n.text ?? "").join("\n");
					if (lang) {
						children.push(new Paragraph({ children: [new TextRun({ text: `[${lang}]`, font: "Courier New", size: 18, color: "888888" })] }));
					}
					for (const line of codeText.split("\n")) {
						children.push(new Paragraph({ shading: { fill: "f5f5f5" }, children: [new TextRun({ text: line, font: "Courier New", size: 20 })] }));
					}
					break;
				}
				case "horizontalRule":
					children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "cccccc" } }, spacing: { after: 200 } }));
					break;
				case "hardBreak":
					children.push(new Paragraph({ children: [new TextRun({ break: 1 })] }));
					break;
				case "image": {
					const src: string = node.attrs?.src ?? "";
					const alt: string = node.attrs?.alt ?? "";
					const width = parseInt(node.attrs?.width) || 500;
					if (src.startsWith("data:")) {
						try {
							const buf = dataUrlToUint8Array(src);
							const mimeType = dataUrlToMime(src);
							const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
							children.push(new Paragraph({
								alignment: AlignmentType.CENTER,
								children: [new ImageRun({
									data: buf,
									transformation: { width, height: Math.round(width * 0.75) },
									altText: { name: alt || "image", title: alt, description: alt },
									type: extension as any,
								})],
							}));
						} catch {
							children.push(new Paragraph({ children: [new TextRun({ text: `[Image: ${alt}]` })] }));
						}
					} else {
						children.push(new Paragraph({ children: [new TextRun({ text: `[Image: ${alt || src}]` })] }));
					}
					break;
				}
				case "table":
					children.push(...processTable(node));
					break;
				case "callout": {
					const calloutType = node.attrs?.type ?? "info";
					const emojis: Record<string, string> = { info: "\u2139\uFE0F", warning: "\u26A0\uFE0F", danger: "\uD83D\uDEA8", tip: "\uDCA1" };
					const runs: any[] = [new TextRun({ text: `${emojis[calloutType] ?? "\u2139\uFE0F"} ` })];
					for (const block of node.content ?? []) {
						for (const child of block.content ?? []) {
							if (child.type === "hardBreak") {
								runs.push(new TextRun({ break: 1 }));
							} else {
								runs.push(...textRuns(child));
							}
						}
					}
					children.push(new Paragraph({ shading: { fill: "f0f0f0" }, indent: { left: convertInchesToTwip(0.25) }, children: runs }));
					break;
				}
				case "inlineMath": {
					const latex = node.attrs?.latex ?? "";
					if (latex) {
						try {
							const mathmlStr = (window as any).katex?.renderToString(latex, { output: "mathml", throwOnError: false }) ?? "";
							children.push(mathmlToDocx(mathmlStr, docxModules));
						} catch {
							children.push(new TextRun({ text: `$${latex}$`, italics: true }));
						}
					}
					break;
				}
				case "blockMath": {
					const latex = node.attrs?.latex ?? "";
					if (latex) {
						try {
							const mathmlStr = (window as any).katex?.renderToString(latex, { output: "mathml", throwOnError: false }) ?? "";
							const mathElement = mathmlToDocx(mathmlStr, docxModules);
							children.push(new Paragraph({
								alignment: AlignmentType.CENTER,
								children: [mathElement],
							}));
						} catch {
							children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `$$${latex}$$`, italics: true })] }));
						}
					}
					break;
				}
				case "emoji": {
					const name = node.attrs?.name ?? "";
					const emojiChar = name;
					children.push(new TextRun({ text: emojiChar }));
					break;
				}
				case "detailsSummary":
				case "detailsContent":
				case "details":
					children.push(...processNodes(node.content ?? []));
					break;
				default:
					if (node.content) {
						children.push(...processNodes(node.content));
					}
					break;
			}
		}
		return children;
	}

	function processListItem(li: any, ordered: boolean): any[] {
		const runs: any[] = [];
		for (const c of li.content ?? []) {
			for (const n of c.content ?? []) {
				if (n.type === "hardBreak") {
					runs.push(new TextRun({ break: 1 }));
				} else {
					runs.push(...textRuns(n));
				}
			}
		}
		if (ordered) {
			return [new Paragraph({ numbering: { reference: "default-numbering", level: 0 }, children: runs })];
		}
		return [new Paragraph({ bullet: { level: 0 }, children: runs })];
	}

	function processTable(tableNode: any): any[] {
		const rows: any[] = [];
		for (const row of tableNode.content ?? []) {
			const cells: any[] = [];
			for (const cell of row.content ?? []) {
				const cellContent = processNodes(cell.content ?? []);
				cells.push(new TableCell({
					children: cellContent.length ? cellContent : [new Paragraph({ children: [] })],
					width: { size: 100 / (row.content?.length ?? 1), type: WidthType.PERCENTAGE },
				}));
			}
			rows.push(new TableRow({ children: cells }));
		}
		return [new Table({ rows })];
	}

	const json = editor.getJSON();
	const docChildren = processNodes(json.content ?? []);

	return new Document({
		numbering: {
			config: [{
				reference: "default-numbering",
				levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) } } } }],
			}],
		},
		sections: [{
			properties: {
				page: {
					margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
				},
			},
			children: docChildren,
		}],
	});
}

function prepareHtmlForExport(html: string): string {
	let result = html;
	result = result.replace(/<span\s+data-type="inline-math"\s+data-latex="([^"]*)"><\/span>/g, (_, latex) => {
		const decoded = latex.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
		return `<span class="katex-inline" data-latex="${decoded.replace(/"/g, "&quot;")}">$${decoded}$</span>`;
	});
	result = result.replace(/<div\s+data-type="block-math"\s+data-latex="([^"]*)"><\/div>/g, (_, latex) => {
		const decoded = latex.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
		return `<div class="katex-block" data-latex="${decoded.replace(/"/g, "&quot;")}">$$${decoded}$$</div>`;
	});
	return result;
}

const KATEX_CDN_CSS = "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css";
const KATEX_CDN_JS = "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.js";
const KATEX_CDN_AUTO_RENDER = "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/contrib/auto-render.min.js";

function getPrintHtml(html: string, title: string): string {
	const prepared = prepareHtmlForExport(html);
	return `<!DOCTYPE html><html><head><title>${title}</title>
<link rel="stylesheet" href="${KATEX_CDN_CSS}">
<style>
body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}
img{max-width:100%;height:auto}
pre{background:#f5f5f5;padding:1rem;overflow-x:auto;border-radius:4px}
code{background:#f0f0f0;padding:0.125rem 0.25rem;border-radius:3px;font-size:0.875em}
pre code{background:none;padding:0}
blockquote{border-left:3px solid #ddd;margin:0;padding-left:1rem;color:#555}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:0.5rem;text-align:left}
h1,h2,h3,h4,h5,h6{margin-top:1.5em;margin-bottom:0.5em}
@media print{body{margin:0}img{max-width:100%}}
</style></head><body>${prepared}</body>
<script src="${KATEX_CDN_JS}"></script>
<script src="${KATEX_CDN_AUTO_RENDER}"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
  if (typeof renderMathInElement !== "undefined") {
    renderMathInElement(document.body, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false},
        {left: "\\\\(", right: "\\\\)", display: false},
        {left: "\\\\[", right: "\\\\]", display: true}
      ],
      throwOnError: false
    });
  }
});
</script>
</html>`;
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
			downloadBlob(new Blob([md], { type: "text/markdown" }), `${filename}.md`);
		};

		const downloadHTML = () => {
			if (!editor) return;
			const rawHtml = editor.getHTML();
			const html = getPrintHtml(rawHtml, noteTitle || "Note");
			downloadBlob(new Blob([html], { type: "text/html" }), `${filename}.html`);
		};

		const downloadPlainText = () => {
			if (!editor) return;
			const text = editor.getText();
			downloadBlob(new Blob([text], { type: "text/plain" }), `${filename}.txt`);
		};

		const printNote = () => {
			const html = editor?.getHTML() ?? "";
			const win = window.open("", "_blank");
			if (!win) return;
			win.document.write(getPrintHtml(html, noteTitle || "Note"));
			win.document.close();
			win.focus();
			setTimeout(() => { win.print(); }, 600);
		};

		const downloadDocx = async () => {
			if (!editor) return;
			try {
				const doc = await buildDocx(editor);
				const { Packer } = await import("docx");
				const blob = await Packer.toBlob(doc);
				downloadBlob(blob, `${filename}.docx`);
			} catch (err) {
				console.error("Failed to export .docx:", err);
			}
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
					<DropdownMenuItem onClick={copyAsMarkdown}>
						<Copy className="mr-2 h-4 w-4" />
						Copy as Markdown
					</DropdownMenuItem>
					<DropdownMenuItem onClick={downloadMarkdown}>
						<FileText className="mr-2 h-4 w-4" />
						Download .md
					</DropdownMenuItem>
					<DropdownMenuItem onClick={downloadHTML}>
						<Download className="mr-2 h-4 w-4" />
						Download .html
					</DropdownMenuItem>
					<DropdownMenuItem onClick={downloadPlainText}>
						<AlignLeft className="mr-2 h-4 w-4" />
						Download .txt
					</DropdownMenuItem>
					<DropdownMenuItem onClick={downloadDocx}>
						<FileIcon className="mr-2 h-4 w-4" />
						Download .docx
					</DropdownMenuItem>
					<DropdownMenuItem onClick={printNote}>
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
