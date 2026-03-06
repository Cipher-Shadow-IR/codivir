"use client";

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";

const client = createClient({
  publicApiKey: (process.env.LIVEBLOCKS_TOKEN || process.env.NEXT_PUBLIC_LIVEBLOCKS_TOKEN) as string,
});

export type Presence = {
  username?: string;
  language?: string;
  isTyping?: boolean;
};

export type Storage = {
  codes: LiveMap<string, string>;
  language: string;
};

const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useOthersListener,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useStorage,
  useMutation,
  useHistory,
  useSelf,
  useStatus,
} = createRoomContext<Presence, Storage>(client);

export {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useOthersListener,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useStorage,
  useMutation,
  useHistory,
  useSelf,
  useStatus,
};
