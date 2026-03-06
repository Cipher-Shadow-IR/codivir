import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    LIVEBLOCKS_TOKEN: process.env.LIVEBLOCKS_TOKEN,
    NEXT_PUBLIC_LIVEBLOCKS_TOKEN: process.env.LIVEBLOCKS_TOKEN,
  },
};

export default nextConfig;
