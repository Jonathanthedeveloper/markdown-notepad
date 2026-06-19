import React, { useState, useMemo } from "react";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const EMOJI_CATEGORIES = [
	{
		name: "Smileys",
		emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"],
	},
	{
		name: "Gestures",
		emojis: ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "💪", "🦾", "🦿"],
	},
	{
		name: "Objects",
		emojis: ["📝", "📌", "📎", "✂️", "📐", "📏", "🔧", "🔨", "⚙️", "💡", "🔦", "📚", "📖", "🔖", "🗂️", "📁", "📂", "🗑️", "🔍", "🔎", "💻", "🖥️", "🖨️", "⌨️", "🖱️", "🖲️", "💾", "💿", "📀", "📱", "📞", "☎️", "📟", "📠", "📺", "📷", "📸", "📹", "🎥", "📽️"],
	},
	{
		name: "Symbols",
		emojis: ["✅", "❌", "⭕", "❗", "❓", "‼️", "⁉️", "💲", "💯", "🔥", "⭐", "🌟", "💫", "✨", "⚡", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎯", "🎯", "🎨", "🏷️", "🔖", "🔗", "📌", "📍", "🔔", "🔕", "📣", "📢", "💬"],
	},
	{
		name: "Arrows",
		emojis: ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", "↔️", "↩️", "↪️", "⤴️", "⤵️", "🔃", "🔄", "🔙", "🔚", "🔛", "🔜", "🔝", "🔀", "🔁", "🔂", "▶️", "⏩", "⏭️", "⏯️", "◀️", "⏪", "⏮️", "🔼", "⏫", "🔽", "⏬", "⏸️", "⏹️", "⏺️", "⏏️", "🎦"],
	},
];

const EmojiPicker = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, ...props }, ref) => {
		const { editor } = useToolbar();
		const [search, setSearch] = useState("");

		const filteredCategories = useMemo(() => {
			if (!search) return EMOJI_CATEGORIES;
			return EMOJI_CATEGORIES.map((cat) => ({
				...cat,
				emojis: cat.emojis.filter(() => true),
			})).filter((cat) => cat.emojis.length > 0);
		}, [search]);

		const insertEmoji = (emoji: string) => {
			editor?.chain().focus().insertContent(emoji).run();
		};

		return (
			<Tooltip>
				<Popover>
					<TooltipTrigger render={
						<PopoverTrigger render={<Button variant="ghost" size="icon" className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)} ref={ref} {...props} />}>
							<SmilePlus className="h-4 w-4" />
						</PopoverTrigger>
					} />
					<PopoverContent align="end" className="w-80 p-2">
						<input
							type="text"
							placeholder="Search emoji..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring mb-2"
						/>
						<div className="max-h-[300px] overflow-y-auto space-y-2">
							{filteredCategories.map((cat) => (
								<div key={cat.name}>
									<h4 className="mb-1 text-xs font-medium text-muted-foreground">{cat.name}</h4>
									<div className="flex flex-wrap gap-0.5">
										{cat.emojis.map((emoji) => (
											<button
												key={emoji}
												onClick={() => insertEmoji(emoji)}
												className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent text-lg"
											>
												{emoji}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</PopoverContent>
				</Popover>
				<TooltipContent>
					<span>Emoji</span>
				</TooltipContent>
			</Tooltip>
		);
	},
);

EmojiPicker.displayName = "EmojiPicker";

export { EmojiPicker };
