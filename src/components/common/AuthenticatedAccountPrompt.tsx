"use client";

import { Loader2 } from "lucide-react";
import { useContext } from "react";
import { ExchangeDataGettersContext } from "@/data/ExchangeDataGettersContext";
import { exchangeConfigs } from "@/data/exchangeConfigs";

export function useAccountGatedContent() {
  const {
    getters: {
      activeExchange: { exchange, isAuthenticated },
    },
  } = useContext(ExchangeDataGettersContext);

  const requiresCredentials =
    (exchangeConfigs[exchange]?.neededCredentials.length ?? 0) > 0;

  return {
    requiresCredentials,
    isCheckingAuth: requiresCredentials && isAuthenticated === "loading",
    showSignInPrompt: requiresCredentials && isAuthenticated !== "yes",
  };
}

export function AuthenticatedAccountPrompt() {
  const { isCheckingAuth } = useAccountGatedContent();

  if (isCheckingAuth) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 min-h-[120px] px-6 py-8 text-center"
        data-testid="account-data-auth-loading"
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying account credentials…</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-1.5 min-h-[120px] px-6 py-8 text-center"
      data-testid="account-data-sign-in-prompt"
    >
      <p className="text-sm text-muted-foreground">
        Sign in to your account to view your data.
      </p>
    </div>
  );
}
