"use client";

import dynamic from "next/dynamic";
import { useContext, useEffect } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { BottomBar } from "./BottomBar";
import { Header } from "./Header";
import { DockLayoutControlProvider } from "./layout/DockLayoutControlContext";
import { SubHeader } from "./SubHeader";
import { useToast } from "./ui/use-toast";

const ExchangeDockLayout = dynamic(
  () => import("./layout/ExchangeDockLayout").then((m) => m.ExchangeDockLayout),
  { ssr: false }
);

export const ExchangeGrid = () => {
  const { toast } = useToast();
  const {
    getters: {
      activeExchange: { error },
    },
  } = useContext(ExchangeDataGettersContext);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <DockLayoutControlProvider>
      <div className="exchange-shell">
        <Header />
        <SubHeader />
        <ExchangeDockLayout />
        <BottomBar />
      </div>
    </DockLayoutControlProvider>
  );
};
