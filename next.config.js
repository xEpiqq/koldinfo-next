/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Helps identify potential problems in your app
    async headers() {
      return [
        {
          // Adjust caching for authentication-sensitive routes
          source: "/protected", // Replace with your actual protected routes
          headers: [
            { key: "Cache-Control", value: "no-store, must-revalidate" },
          ],
        },
      ];
    },
    async redirects() {
      return [
        {
          // Redirect users to sign-in if not authenticated
          source: "/protected",
          has: [
            {
              type: "cookie",
              key: "sb-access-token", // Supabase session cookie
              value: "^(?!null$).*$", // Ensure it's not null
            },
          ],
          permanent: false,
          destination: "/sign-in",
        },
      ];
    },
  };
  
  module.exports = nextConfig;
  