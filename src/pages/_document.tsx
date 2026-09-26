import { Head, Html, Main, NextScript } from "next/document";
import { fontVariableClassName } from "@/lib/fonts";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning className={fontVariableClassName}>
      <Head />
      <body className="font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
