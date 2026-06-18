import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

function looksLikeMarkdown(text: string): boolean {
  return (
    /^#{1,6}\s/.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /\[.+\]\(.+\)/.test(text) ||
    /^[-*+]\s/.test(text) ||
    /^>\s/.test(text) ||
    /`[^`]+`/.test(text) ||
    /^\|.*\|/.test(text) ||
    /^\d+\.\s/.test(text)
  );
}

export const PasteMarkdown = Extension.create({
  name: "pasteMarkdown",

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey("pasteMarkdown"),
        props: {
          handlePaste(_view, event) {
            const text = event.clipboardData?.getData("text/plain");

            if (!text || !looksLikeMarkdown(text)) {
              return false;
            }

            const json = editor.storage.markdown.manager.parse(text);
            editor.commands.insertContent(json);
            return true;
          },
        },
      }),
    ];
  },
});
