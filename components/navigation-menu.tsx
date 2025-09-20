"use client";
import {AddPageButton} from "@/components/add-page-button";
import { Box, Divider } from "@mantine/core";

export default function NavigationMenu() {
  return (
    <div className={"space-y-2"}>
      <Box>
        <AddPageButton />
      </Box>
      <Divider />
    </div>
  );
}
