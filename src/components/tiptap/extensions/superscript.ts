import Superscript from "@tiptap/extension-superscript";

export const SuperscriptExtended = Superscript.extend({
  renderMarkdown: (node: any, h: any) => {
    return `<sup>${h.renderChildren(node)}</sup>`;
  },
});
