"use client";
import { useState } from "react";
import { Select, Code } from "@mantine/core";
import { useFetch } from "@mantine/hooks";

interface Settings {
  id: string;
  allowRegister: boolean;
}

function boolToOption(value?: boolean) {
  if (value === true) return "Enable";
  if (value === false) return "Disable";
  return null;
}

function optionToBool(value: string) {
  return value === "Enable";
}

export default function SettingsPage() {
  const { data, loading, refetch } =
    useFetch<Settings>("/api/settings/");
  const [saving, setSaving] = useState(false);

  async function handleChange(value: string | null) {
    if (!value) return;
    setSaving(true);

    await fetch("/api/settings/allow-register", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowRegister: optionToBool(value) }),
    });

    setSaving(false);
    await refetch();
  }

  return (
    <div>
      <Select
        label="Allow other User Register"
        data={["Enable", "Disable"]}
        value={boolToOption(data?.allowRegister)}
        onChange={handleChange}
        disabled={loading || saving}
      />
      <Code>{JSON.stringify(data)}</Code>
    </div>
  );
}
