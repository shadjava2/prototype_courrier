"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, updateCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function TraitementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    observations: "",
    action: "TRAITE" as "TRAITE" | "NECESSITE_VALIDATION",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const loadCourriers = () => {
      if (!user) return;
      const all = getCourriers();
      const àTraiter = all.filter(
        (c) =>
          c.statut === "EN_CIRCUIT" &&
          c.type === "ENTRANT" &&
          (c.service === user.service || user.role === "ADMIN" || user.role === "DIRECTEUR")
      );
      setCourriers(àTraiter);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    if (selectedCourrier) {
      setFormData({
        observations: selectedCourrier.observations || "",
        action: "TRAITE",
      });
    }
  }, [selectedCourrier]);

  const handleTraiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourrier) return;

    setLoading(true);
    try {
      const newStatut = formData.action === "NECESSITE_VALIDATION"
        ? "EN_ATTENTE_VALIDATION"
        : "VALIDE";

      updateCourrier(selectedCourrier.id, {
        statut: newStatut,
        traitéPar: user?.id,
        dateTraitement: new Date().toISOString(),
        observations: formData.observations,
      });

      addNotification({
        message: `Courrier ${selectedCourrier.ref} traité par ${user?.prenom} ${user?.nom}`,
        niveau: "INFO",
        courrierId: selectedCourrier.id,
      });

      alert("Courrier traité avec succès !");
      setSelectedCourrier(null);

      if (user) {
        const all = getCourriers();
        const àTraiter = all.filter(
          (c) =>
            c.statut === "EN_CIRCUIT" &&
            c.type === "ENTRANT" &&
            (c.service === user.service || user.role === "ADMIN" || user.role === "DIRECTEUR")
        );
        setCourriers(àTraiter);
      }
    } catch (error) {
      alert("Erreur lors du traitement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Traitement de courrier</h1>
          <p className="text-slate-600 mt-1">
            Traiter les courriers affectés à votre service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Courriers à traiter
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courriers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucun courrier en attente de traitement
                </p>
              ) : (
                courriers.map((courrier) => (
                  <button
                    key={courrier.id}
                    onClick={() => setSelectedCourrier(courrier)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedCourrier?.id === courrier.id
                        ? "border-[#0051A8] bg-[#0051A8]/10"
                        : "border-slate-200 hover:border-[#0051A8]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-900">{courrier.ref}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        {courrier.priorité}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-1">{courrier.objet}</div>
                    <div className="text-xs text-slate-500">
                      De: {courrier.expéditeur} | Service: {courrier.service}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Formulaire de traitement
            </h2>

            {!selectedCourrier ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">📋</div>
                <p>Sélectionnez un courrier à traiter</p>
              </div>
            ) : (
              <form onSubmit={handleTraiter} className="space-y-4">
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <label className="text-xs text-slate-500">Référence</label>
                    <div className="font-semibold text-slate-900">{selectedCourrier.ref}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Objet</label>
                    <div className="text-slate-900">{selectedCourrier.objet}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Expéditeur</label>
                    <div className="text-slate-900">{selectedCourrier.expéditeur}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Action <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.action}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        action: e.target.value as "TRAITE" | "NECESSITE_VALIDATION",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                  >
                    <option value="TRAITE">Traité - Peut être validé</option>
                    <option value="NECESSITE_VALIDATION">Nécessite validation hiérarchique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Observations / Notes de traitement
                  </label>
                  <textarea
                    required
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                    placeholder="Décrire les actions entreprises, les décisions prises, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Traitement..." : "Enregistrer le traitement"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

