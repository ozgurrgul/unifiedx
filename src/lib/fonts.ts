import { IBM_Plex_Mono, Inter } from "next/font/google";

const inter = Inter({
  weight: "400",
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: "400",
  variable: "--font-ibm-plex",
  subsets: ["latin"],
});

/** Apply on `<html>` so Radix portals (dialog, popover, toast) inherit Inter. */
export const fontVariableClassName = `${inter.variable} ${ibmPlexMono.variable}`;
