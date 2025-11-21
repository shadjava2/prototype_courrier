"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";
import { Courrier } from "@/lib/types";
import Link from "next/link";

export default function RecherchePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtreType, setFiltreType] = useState<"TOUS" | "ENTRANT" | "SORTANT">("TOUS");
  const [filtreStatut, setFiltreStatut] = useState<string>("TOUS");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const loadCourriers = () => {
      const all = getCourriers();
      setCourriers(all);
    };

    loadCourriers();
  }, [user, router]);

  const filteredCourriers = courriers.filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      c.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.expéditeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.destinataire.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filtreType === "TOUS" || c.type === filtreType;
    const matchStatut = filtreStatut === "TOUS" || c.statut === filtreStatut;

    return matchSearch && matchType && matchStatut;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Recherche de courrier</h1>
          <p className="text-slate-600 mt-1">
            Rechercher et consulter les courriers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Référence, objet, expéditeur..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value as "TOUS" | "ENTRANT" | "SORTANT")}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
              >
                <option value="TOUS">Tous</option>
                <option value="ENTRANT">Entrant</option>
                <option value="SORTANT">Sortant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Statut
              </label>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
              >
                <option value="TOUS">Tous</option>
                <option value="RECU">Reçu</option>
                <option value="NUMERISE">Numérisé</option>
                <option value="EN_CIRCUIT">En circuit</option>
                <option value="EN_ATTENTE_VALIDATION">En attente</option>
                <option value="VALIDE">Validé</option>
                <option value="REPONDU">Répondu</option>
                <option value="ARCHIVE">Archivé</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Résultats ({filteredCourriers.length})
            </h2>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCourriers.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Aucun courrier trouvé
              </p>
            ) : (
              filteredCourriers.map((courrier) => (
                <Link
                  key={courrier.id}
                  href={`/courrier/${courrier.id}`}
                  className="block p-4 border border-slate-200 rounded-lg hover:border-[#0051A8] hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-900">{courrier.ref}</span>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          courrier.type === "ENTRANT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {courrier.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          courrier.statut === "ARCHIVE"
                            ? "bg-slate-100 text-slate-700"
                            : courrier.statut === "VALIDE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {courrier.statut}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 mb-1">{courrier.objet}</div>
                  <div className="text-xs text-slate-500">
                    {courrier.type === "ENTRANT" ? "De" : "À"}:{" "}
                    {courrier.type === "ENTRANT" ? courrier.expéditeur : courrier.destinataire}
                    {courrier.service && ` | Service: ${courrier.service}`}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

