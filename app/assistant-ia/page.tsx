"use client";

import Layout from "@/components/Layout";
import AssistantIA from "@/components/AssistantIA";

export default function AssistantIAPage() {
  // Le Layout gère déjà l'authentification et la redirection
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Assistant numérique (IA)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Recommandations et alertes intelligentes pour optimiser votre gestion de courrier
          </p>
        </div>

        <AssistantIA />
      </div>
    </Layout>
  );
}

