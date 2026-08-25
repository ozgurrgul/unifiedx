"use client";

import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] gap-4">
        <h1 className="text-2xl font-bold tracking-tight">UnifiedX</h1>
        <p className="text-muted-foreground text-sm">
          Select an exchange from the header to start trading
        </p>
      </div>
    </div>
  );
}
