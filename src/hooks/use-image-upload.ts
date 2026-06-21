import { useCallback, useRef, useState } from "react";

interface UseImageUploadProps {
  onUpload?: (url: string) => void;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dummyUpload = async (_file: File, dataUrl: string): Promise<string> => {
    try {
      setUploading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Math.random() < 0.2) {
        throw new Error("Upload failed - This is a demo error");
      }
      
      setError(null);
      return dataUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);

        try {
          const dataUrl = await readFileAsDataURL(file);
          setPreviewUrl(dataUrl);
          previewRef.current = dataUrl;

          const uploadedUrl = await dummyUpload(file, dataUrl);
          onUpload?.(uploadedUrl);
        } catch {
          setPreviewUrl(null);
          setFileName(null);
          previewRef.current = null;
        }
      }
    },
    [onUpload]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    uploading,
    error,
  };
}
