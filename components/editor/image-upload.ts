import { createImageUpload } from "novel";
import { notifications } from "@mantine/notifications";

const onUpload = (file: File) => {
  const promise = fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file?.type || "application/octet-stream",
      "x-vercel-filename": file?.name || "image.png",
    },
    body: file,
  });

  return new Promise((resolve, reject) => {
    const id = notifications.show({
      loading: true,
      title: "Uploading image...",
      message: "Please wait while we upload your image",
      autoClose: false,
      withCloseButton: false,
    });

    promise.then(async (res) => {
      try {
        // Successfully uploaded image
        if (res.status === 200) {
          const { url } = (await res.json()) as { url: string };
          // preload the image
          const image = new Image();
          image.src = url;
          image.onload = () => {
            notifications.update({
              id,
              color: "green",
              title: "Success",
              message: "Image uploaded successfully.",
              loading: false,
              autoClose: 2000,
            });
            resolve(url);
          };
          // No blob store configured
        } else if (res.status === 401) {
          notifications.update({
            id,
            color: "yellow",
            title: "Warning",
            message: "`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.",
            loading: false,
            autoClose: 4000,
          });
          resolve(file);
        } else {
          throw new Error("Error uploading image. Please try again.");
        }
      } catch (error) {
        notifications.update({
          id,
          color: "red",
          title: "Error",
          message: error instanceof Error ? error.message : "Error uploading image. Please try again.",
          loading: false,
          autoClose: 4000,
        });
        reject(error);
      }
    }).catch((error) => {
      notifications.update({
        id,
        color: "red",
        title: "Error",
        message: error instanceof Error ? error.message : "Error uploading image. Please try again.",
        loading: false,
        autoClose: 4000,
      });
      reject(error);
    });
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "File type not supported.",
      });
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "File size too big (max 20MB).",
      });
      return false;
    }
    return true;
  },
});
