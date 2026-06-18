import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

export function ImageLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [src, setSrc] = useState("");

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSrc("");
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && target.closest(".ProseMirror")) {
        const img = target as HTMLImageElement;
        if (img.src && !img.closest("[data-callout]")) {
          e.preventDefault();
          setSrc(img.src);
          setIsOpen(true);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <button
        onClick={handleClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
