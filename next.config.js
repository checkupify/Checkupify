/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://lguoussmsusadvmexjkb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndW91c3Ntc3VzYWR2bWV4amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njc1OTcsImV4cCI6MjA5MDM0MzU5N30.Mq6nW2ItZqywuIbVeOUR9HQOglZOL5Wm0uSFwT6hfjw',
  }
};
module.exports = nextConfig;
