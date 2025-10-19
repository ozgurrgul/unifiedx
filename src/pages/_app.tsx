import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";

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
    <>
      <Head>
        <title>UnifiedX - Multi-Exchange Crypto Trading Platform</title>
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <main className={`${font1.variable} ${font2.variable}`}>
          <Component {...pageProps} />
          <Analytics />
        </main>
      </ThemeProvider>
    </>
  );
}
