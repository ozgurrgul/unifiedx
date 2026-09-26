import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@/components/theme-provider";
import { fontVariableClassName } from "@/lib/fonts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>UnifiedX - Multi-Exchange Crypto Trading Platform</title>
      </Head>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className={`${fontVariableClassName} font-sans min-h-screen`}>
          <Component {...pageProps} />
          <Analytics />
        </div>
      </ThemeProvider>
    </>
  );
}
