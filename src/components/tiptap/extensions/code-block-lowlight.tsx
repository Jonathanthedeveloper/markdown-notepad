import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

function CodeBlockNodeView({ node, updateAttributes, extension }: any) {
  const languages = extension.options.lowlight.listLanguages();
  const currentLang = node.attrs.language || "";

  return (
    <NodeViewWrapper className="relative">
      <select
        contentEditable={false}
        suppressContentEditableWarning
        value={currentLang}
        onChange={(e) => updateAttributes({ language: e.target.value || null })}
        className="absolute top-2 right-2 z-10 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">auto</option>
        {languages.map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}

export const CodeBlockLowlightExt = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
}).configure({
  lowlight,
  defaultLanguage: "plaintext",
});
