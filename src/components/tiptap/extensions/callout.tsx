import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutType = "info" | "warning" | "danger" | "tip";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type?: CalloutType) => ReturnType;
      toggleCallout: (type?: CalloutType) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-callout-type") || "info",
        renderHTML: (attributes) => ({ "data-callout-type": attributes.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "", class: "callout" }), 0];
  },

  addCommands() {
    return {
      setCallout:
        (type: CalloutType = "info") =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { type });
        },
      toggleCallout:
        (type: CalloutType = "info") =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => this.editor.commands.toggleCallout("info"),
    };
  },

  renderMarkdown: (node) => {
    const calloutType = node.attrs?.type ?? "info";
    const content = (node.content ?? [])
      .map((child: any) => {
        if (child.type === "paragraph") {
          return (child.content ?? []).map((n: any) => n.text ?? "").join("");
        }
        return "";
      })
      .join("\n");
    const lines = content.split("\n");
    const header = `> [!${calloutType}]`;
    const body = lines.map((line: string) => `> ${line}`).join("\n");
    return `${header}\n${body}`;
  },
});
