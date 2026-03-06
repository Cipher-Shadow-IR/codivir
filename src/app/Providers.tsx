"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const publicApiKey = process.env.LIVEBLOCKS_TOKEN || process.env.NEXT_PUBLIC_LIVEBLOCKS_TOKEN;

  if (!publicApiKey) {
    console.warn("LIVEBLOCKS_TOKEN is missing. Collaboration features will be disabled.");
    return <>{children}</>;
  }

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      {children}
    </LiveblocksProvider>
  );
}
