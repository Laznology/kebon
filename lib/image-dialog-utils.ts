import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ImageUrlDialog } from "@/components/editor/image-url-dialog";

export const showImageUrlDialog = (): Promise<{
  url: string;
  alt?: string;
  title?: string;
} | null> => {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    let isResolved = false;

    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        root.unmount();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    };

    const handleSubmit = (data: {
      url: string;
      alt?: string;
      title?: string;
    }) => {
      cleanup();
      resolve(data);
    };

    const handleClose = () => {
      cleanup();
      resolve(null);
    };

    root.render(
      createElement(ImageUrlDialog, {
        open: true,
        onOpenChange: handleClose,
        onSubmit: handleSubmit,
      }),
    );
  });
};
