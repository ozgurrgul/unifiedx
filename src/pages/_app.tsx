import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const font1 = Inter({
  weight: "400",
  variable: "--font-inter",
  subsets: ["latin"],
});

const font2 = IBM_Plex_Mono({
  weight: "400",
  variable: "--font-ibm-plex",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${font1.variable} ${font2.variable}`}>
      <Component {...pageProps} />
      <Analytics />
    </main>
  );
}
