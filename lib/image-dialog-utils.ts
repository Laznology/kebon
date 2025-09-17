import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ImageUrlDialog } from "@/components/editor/image-url-dialog";

export const showImageUrlDialog = (editor?: any): Promise<{ url: string; alt?: string; title?: string } | null> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    const handleSubmit = (data: { url: string; alt?: string; title?: string }) => {
      root.unmount();
      document.body.removeChild(container);
      resolve(data);
    };
    
    const handleClose = () => {
      root.unmount();
      document.body.removeChild(container);
      resolve(null);
    };
    
    root.render(
      createElement(ImageUrlDialog, {
        open: true,
        onOpenChange: handleClose,
        onSubmit: handleSubmit,
      })
    );
  });
};
