"use client";
import {
  Switch,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Switch color="dark.4"
      checked={computedColorScheme === "dark"}
      onChange={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      offLabel={<Icon icon="mdi:weather-night" width={16} height={16} />}
      onLabel={<Icon icon="mdi:weather-sunny" width={16} height={16} />}
    />
  );
}
