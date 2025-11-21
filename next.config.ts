import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ignorer les erreurs d'hydratation causées par les extensions de navigateur
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Désactiver la génération statique pour les pages dynamiques
  output: 'standalone',
};

export default nextConfig;
