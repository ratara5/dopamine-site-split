/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained .next/standalone build — this is what
  // the Dockerfile copies into the final image. Required for running
  // on a plain VPS instead of Vercel's managed runtime.
  output: "standalone",
  images: {
    // Add your MinIO/S3-compatible media domain here once product/
    // provider images start being served from there instead of
    // /public/parody-assets, e.g.:
    // remotePatterns: [{ protocol: "https", hostname: "media.yourdomain.com" }]
    remotePatterns: [],
  },
};

module.exports = nextConfig;
