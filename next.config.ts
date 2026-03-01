import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const nextConfig: NextConfig = {
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;
