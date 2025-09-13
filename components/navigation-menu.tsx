"use client";
import AddPageButton from "@/components/add-page-button";
import { Box, Divider } from "@mantine/core";
import RecentPageNav from "@/components/recent-page-nav";
import PublishedPageNav from "./published-page-nav";
import DraftPageNav from "./draft-page-nav";

export default function NavigationMenu() {
  return (
    <div className={"space-y-2"}>
      <Box>
        <AddPageButton />
      </Box>
      <Divider />
      <RecentPageNav />
      <DraftPageNav />
      <PublishedPageNav />
    </div>
  );
}
