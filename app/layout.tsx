import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@mantine/spotlight/styles.css';
import Provider from "./proivder";
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme={"auto"} />
        <link rel="icon" href="/Kebon.ico" type="image/x-icon" />
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
