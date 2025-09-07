"use client";
import {
  Switch,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { MoonIcon, CloudSunRain } from "lucide-react";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Switch
      checked={computedColorScheme === "dark"}
      onChange={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      offLabel={<MoonIcon />}
      onLabel={<CloudSunRain />}
    />
  );
}
