import Subscript from "@tiptap/extension-subscript";

export const SubscriptExtended = Subscript.extend({
  renderMarkdown: (node: any, h: any) => {
    return `<sub>${h.renderChildren(node)}</sub>`;
  },
});
