"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";
import { Courrier } from "@/lib/types";
import Link from "next/link";

export default function CourriersEntrantsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [filtre, setFiltre] = useState<"tous" | "en_attente" | "urgents" | "a_traiter">("tous");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadCourriers = () => {
      const all = getCourriers();
      let filtered = all.filter((c) => c.type === "ENTRANT");

      switch (filtre) {
        case "en_attente":
          filtered = filtered.filter(
            (c) => c.statut === "EN_CIRCUIT" || c.statut === "EN_ATTENTE_VALIDATION"
          );
          break;
        case "urgents":
          filtered = filtered.filter(
            (c) => c.priorité === "URGENTE" || c.priorité === "TRES_URGENTE"
          );
          break;
        case "a_traiter":
          filtered = filtered.filter(
            (c) => c.statut === "EN_CIRCUIT" && c.service === user.service
          );
          break;
      }

      setCourriers(filtered);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router, filtre]);

  const getServiceColor = (service?: string) => {
    const colors: Record<string, string> = {
      Cabinet: "bg-blue-100 text-blue-700",
      "Secrétariat Général": "bg-purple-100 text-purple-700",
      Inspection: "bg-orange-100 text-orange-700",
      "Direction des Transports": "bg-green-100 text-green-700",
    };
    return colors[service || ""] || "bg-slate-100 text-slate-700";
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, string> = {
      ARCHIVE: "bg-slate-100 text-slate-700",
      VALIDE: "bg-emerald-100 text-emerald-700",
      EN_CIRCUIT: "bg-blue-100 text-blue-700",
      EN_ATTENTE_VALIDATION: "bg-amber-100 text-amber-700",
      NUMERISE: "bg-cyan-100 text-cyan-700",
      RECU: "bg-gray-100 text-gray-700",
    };
    return badges[statut] || "bg-slate-100 text-slate-700";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Courriers entrants</h1>
            <p className="text-slate-500 text-sm mt-1">Gérer tous les courriers entrants</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-modern hover:shadow-modern-lg transition-all">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "tous", label: "Tous" },
              { id: "en_attente", label: "En attente" },
              { id: "urgents", label: "Urgents" },
              { id: "a_traiter", label: "À traiter" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltre(f.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtre === f.id
                    ? "bg-[#0033A0] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des courriers */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-modern hover:shadow-modern-lg transition-all">
          <div className="p-5">
            <div className="space-y-4">
              {courriers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-slate-600">Aucun courrier trouvé</p>
                </div>
              ) : (
                courriers.map((courrier) => (
                  <Link
                    key={courrier.id}
                    href={`/courrier/${courrier.id}`}
                    className="block p-3 border border-slate-200 rounded-md hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all transform hover:scale-[1.01] animate-slide-in"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900 text-lg">{courrier.ref}</span>
                        {courrier.service && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getServiceColor(courrier.service)}`}>
                            {courrier.service}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatutBadge(courrier.statut)}`}>
                          {courrier.statut}
                        </span>
                        {courrier.priorité && (courrier.priorité === "URGENTE" || courrier.priorité === "TRES_URGENTE") && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                            {courrier.priorité}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-900 font-medium mb-1">{courrier.objet}</div>
                    <div className="text-xs text-slate-600">
                      De: {courrier.expéditeur} | Reçu le: {courrier.dateRéception ? new Date(courrier.dateRéception).toLocaleDateString("fr-FR") : courrier.date}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
