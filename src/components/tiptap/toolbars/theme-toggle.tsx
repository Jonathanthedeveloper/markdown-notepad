import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ThemeToggle = React.forwardRef<HTMLButtonElement, Parameters<typeof Button>[0]>(
	({ className, ...props }, ref) => {
		const [dark, setDark] = useState(false);

		useEffect(() => {
			const isDark = document.documentElement.classList.contains("dark");
			setDark(isDark);
		}, []);

		const toggle = () => {
			const next = !dark;
			setDark(next);
			if (next) {
				document.documentElement.classList.add("dark");
				localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.classList.remove("dark");
				localStorage.setItem("theme", "light");
			}
		};

		return (
			<Button
				variant="ghost"
				size="icon"
				className={cn("h-8 w-8 p-0 sm:h-9 sm:w-9", className)}
				onClick={toggle}
				ref={ref}
				{...props}
			>
				{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
			</Button>
		);
	},
);

ThemeToggle.displayName = "ThemeToggle";

export { ThemeToggle };
