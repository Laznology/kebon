import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import '@mantine/spotlight/styles.css';
import Provider from "./provider";
import SessionProvider from "@/components/SessionProvider";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  return {
    title: "Kebon",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={"auto"} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} !text-primary !bg-background antialiased`}
      >
        <SessionProvider>
          <MantineProvider
            defaultColorScheme={"auto"}
            withGlobalClasses={true}
            withCssVariables={true}
          >
            <Provider>{children}</Provider>
            <Notifications />
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
