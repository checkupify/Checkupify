/** @type {import('next').NextConfig} */
const CRM_URL = 'https://checkupify-git-deploy-crm-checkupifys-projects.vercel.app';
const PD_URL  = 'https://checkupify-git-deploy-pd-checkupifys-projects.vercel.app';
const KB_URL  = 'https://checkupify-git-deploy-kb-checkupifys-projects.vercel.app';
const HR_URL  = 'https://checkupify-git-deploy-hr-checkupifys-projects.vercel.app';

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://lguoussmsusadvmexjkb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndW91c3Ntc3VzYWR2bWV4amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njc1OTcsImV4cCI6MjA5MDM0MzU5N30.Mq6nW2ItZqywuIbVeOUR9HQOglZOL5Wm0uSFwT6hfjw',
  },
  async rewrites() {
    return [
      // CRM → checkupify.com/crm
      { source: '/crm',          destination: `${CRM_URL}/` },
      { source: '/crm/:path*',   destination: `${CRM_URL}/:path*` },
      // Provider Dashboard → checkupify.com/pd
      { source: '/pd',           destination: `${PD_URL}/` },
      { source: '/pd/:path*',    destination: `${PD_URL}/:path*` },
      // Knowledge Base → checkupify.com/kb
      { source: '/kb',           destination: `${KB_URL}/` },
      { source: '/kb/:path*',    destination: `${KB_URL}/:path*` },
      // HR Portal → checkupify.com/hr
      { source: '/hr',           destination: `${HR_URL}/` },
      { source: '/hr/:path*',    destination: `${HR_URL}/:path*` },
      // Static assets for sub-apps
      { source: '/_next/:path*', destination: '/_next/:path*' },
    ];
  },
  async redirects() {
    return [
      { source: '/crm/', destination: '/crm', permanent: false },
      { source: '/pd/',  destination: '/pd',  permanent: false },
      { source: '/kb/',  destination: '/kb',  permanent: false },
      { source: '/hr/',  destination: '/hr',  permanent: false },
    ];
  },
};
module.exports = nextConfig;
