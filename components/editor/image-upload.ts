import { createImageUpload } from "novel";
import { notifications } from "@mantine/notifications";

const onUpload = (file: File) => {
  const promise = fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file.type,
      "x-filename": file.name,
    },
    body: file,
  });

  return new Promise((resolve, reject) => {
    const id = notifications.show({
      loading: true,
      title: "Uploading Image ...",
      message: "Please wait while we uploading",
      autoClose: true,
      withCloseButton: true,
    });

    promise.then(async (result) => {
      if (result.ok) {
        const data = await result.json();
        console.log("res:", data);

        const { url, width, height, alt } = data;

        const image = new Image();
        image.src = url;
        image.height = height;
        image.width = width;
        image.alt = alt;
        image.onload = () => {
          notifications.update({
            id,
            color: "green",
            title: "Success",
            message: "Image uploaded successfully",
            loading: false,
            autoClose: 1500,
          })
          resolve(url);
        }
      }
      else {
        throw new Error("Error uploading image, please try again")
      }
    }).catch((error) => {
      notifications.update({
        id,
        color: "red",
        title:  "Error",
        message: error.message,
        loading: false,
        autoClose: 3000
      })
      reject(error);
    });
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file: File) => {
    if (!file.type.includes("image/")) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "File type not supported"
      })
    }
    if (file.size/ 1024 / 1024 > 5){
      notifications.show({
        color: "red",
        title: "Error",
        message: "File size to big (max 5MB)"
      })
      return false;
    }
    return true;
  }
})
