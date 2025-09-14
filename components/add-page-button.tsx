"use client";
import { Button, Modal, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function AddPageButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      title: "",
      published: "false",
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : "Cannot empty"),
    },
  });

  const router = useRouter();

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const payload = {
        title: values.title,
        published: values.published === "true",
      }
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const title = data.title;
      const slug = title.trim().toLowerCase().replace(/\s+/g, "-");

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
      router.push(`/${slug}`);
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
      <Button
        leftSection={<Icon icon={"line-md:plus"} width={18} height={18} />}
        fullWidth={true}
        onClick={open}
        variant="filled"
      >
        Add New Page
      </Button>

      <Modal opened={opened} onClose={close} title="Add New Page">
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-2">
          <TextInput
            {...form.getInputProps("title")}
            label="Title"
            placeholder="Enter page title"
          />
          <Select
            label={"Status"}
            {...form.getInputProps("published")}
            data={[
              { value: "true", label: "Published"},
              { value: "false", label: "Draft"},
            ]}
            defaultValue={form.values.published}
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
