"use client";

import { ReactNode } from "react";
import { RoomProvider } from "@/lib/liveblocks";
import { LiveMap } from "@liveblocks/client";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Loader2 } from "lucide-react";

export function CollaborativeRoom({ roomId, children }: { roomId: string; children: ReactNode }) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ username: "", language: "html", isTyping: false }}
      initialStorage={{
        codes: new LiveMap(),
        language: "html",
      }}
    >
      <ClientSideSuspense fallback={
        <div className="h-screen w-full bg-[#070711] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        </div>
      }>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}
