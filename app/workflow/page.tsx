"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";
import { Courrier } from "@/lib/types";
import Link from "next/link";

export default function WorkflowPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [filtre, setFiltre] = useState<"mes_taches" | "a_valider" | "en_retard">("mes_taches");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadCourriers = () => {
      const all = getCourriers();
      let filtered: Courrier[] = [];

      switch (filtre) {
        case "mes_taches":
          filtered = all.filter(
            (c) =>
              c.responsableActuel === user.id ||
              (c.service === user.service && (c.statut === "EN_CIRCUIT" || c.statut === "EN_ATTENTE_VALIDATION"))
          );
          break;
        case "a_valider":
          filtered = all.filter(
            (c) => c.statut === "EN_ATTENTE_VALIDATION" && (user.role === "DIRECTEUR" || user.role === "ADMIN")
          );
          break;
        case "en_retard":
          filtered = all.filter((c) => {
            if (c.dateLimiteTraitement) {
              return new Date(c.dateLimiteTraitement) < new Date() && c.statut !== "ARCHIVE" && c.statut !== "VALIDE";
            }
            if (c.dateRéception) {
              const jours = Math.floor(
                (new Date().getTime() - new Date(c.dateRéception).getTime()) / (1000 * 60 * 60 * 24)
              );
              return jours > 7 && c.statut !== "ARCHIVE" && c.statut !== "VALIDE";
            }
            return false;
          });
          break;
      }

      setCourriers(filtered);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router, filtre]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Workflow & Tâches</h1>
          <p className="text-slate-500 text-sm mt-1">Gérer vos tâches et le workflow des courriers</p>
        </div>

        {/* Filtres */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "mes_taches", label: "Mes tâches" },
              { id: "a_valider", label: "À valider" },
              { id: "en_retard", label: "En retard" },
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

        {/* Liste des tâches */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-5">
            <div className="space-y-4">
              {courriers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-slate-600">Aucune tâche trouvée</p>
                </div>
              ) : (
                courriers.map((courrier) => {
                  const joursRetard = courrier.dateLimiteTraitement
                    ? Math.floor(
                        (new Date().getTime() - new Date(courrier.dateLimiteTraitement).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : courrier.dateRéception
                    ? Math.floor(
                        (new Date().getTime() - new Date(courrier.dateRéception).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  return (
                    <Link
                      key={courrier.id}
                      href={`/courrier/${courrier.id}`}
                      className="block p-4 border-2 border-slate-200 rounded-lg hover:border-[#0033A0] hover:bg-[#0033A0]/5 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900">{courrier.ref}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              courrier.statut === "EN_ATTENTE_VALIDATION"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {courrier.statut}
                          </span>
                          {joursRetard > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                              Retard: {joursRetard} jour{joursRetard > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-slate-900 font-medium mb-1">{courrier.objet}</div>
                      <div className="text-xs text-slate-600">
                        Service: {courrier.service || "N/A"} | Priorité: {courrier.priorité || "NORMALE"}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
