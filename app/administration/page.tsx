"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";

export default function AdministrationPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  const mockUsers = [
    { id: "1", nom: "Dupont", prenom: "Jean", role: "AGENT", service: "Cabinet", email: "j.dupont@mtr.rdc" },
    { id: "2", nom: "Martin", prenom: "Marie", role: "DIRECTEUR", service: "Secrétariat Général", email: "m.martin@mtr.rdc" },
    { id: "3", nom: "Bernard", prenom: "Paul", role: "RECEPTIONNISTE", service: "Réception", email: "p.bernard@mtr.rdc" },
  ];

  const mockServices = [
    "Cabinet",
    "Secrétariat Général",
    "Inspection",
    "Direction des Transports",
    "Direction du Travail",
    "Direction de l'Emploi",
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-600 mt-1">Gérer les utilisateurs, rôles et services</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gestion des utilisateurs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Utilisateurs</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {mockUsers.map((u) => (
                  <div key={u.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {u.prenom} {u.nom}
                        </div>
                        <div className="text-sm text-slate-600">{u.email}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Service: {u.service}</div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-colors text-sm font-medium">
                + Ajouter un utilisateur
              </button>
            </div>
          </div>

          {/* Gestion des services */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Services</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {mockServices.map((service) => (
                  <div
                    key={service}
                    className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                  >
                    <span className="text-slate-900">{service}</span>
                    <button className="text-xs text-[#0033A0] hover:underline">Modifier</button>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-colors text-sm font-medium">
                + Ajouter un service
              </button>
            </div>
          </div>

          {/* Modèles de documents */}
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Modèles de documents</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Lettre officielle", "Note de service", "Arrêté", "Décision", "Circulaire"].map(
                  (modele) => (
                    <div
                      key={modele}
                      className="p-4 border border-slate-200 rounded-lg hover:border-[#0033A0] transition-colors cursor-pointer"
                    >
                      <div className="text-sm font-medium text-slate-900 mb-1">{modele}</div>
                      <div className="text-xs text-slate-500">Modèle standard</div>
                    </div>
                  )
                )}
              </div>
              <button className="mt-4 px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-colors text-sm font-medium">
                + Ajouter un modèle
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
