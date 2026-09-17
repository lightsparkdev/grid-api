/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://docs.lightspark.com https://*.lightspark.com https://*.mintlify.app https://*.mintlify.dev https://*.mintlify.site http://localhost:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
