/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { withPlausibleProxy } from "next-plausible";

import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
  },
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/billing",
        permanent: false,
      },
    ];
  },
};

export default withPlausibleProxy({})(config);
