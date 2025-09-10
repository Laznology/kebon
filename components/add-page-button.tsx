"use client";
import { Button, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export default function AddPageButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : "Cannot empty"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        notifications.show({
          title: "Error",
          message: data.error,
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Success",
        message: "Page created successfully",
        color: "green",
      });
    } catch (err) {
      notifications.show({
        title: "Error occurred",
        message: `Error while creating page ${err}`,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button onClick={open} variant="filled">
        Add New Page
      </Button>

      <Modal opened={opened} onClose={close} title="Add New Page">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            {...form.getInputProps("title")}
            label="Title"
            placeholder="Enter page title"
          />
          <Button
            loaderProps={{ type: "dots " }}
            loading={loading}
            type="submit"
            mt="md"
          >
            Submit
          </Button>
        </form>
      </Modal>
    </>
  );
}
