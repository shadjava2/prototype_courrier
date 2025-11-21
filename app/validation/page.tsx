"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, updateCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function ValidationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    décision: "VALIDE" as "VALIDE" | "REJETE" | "RETOUR",
    observations: "",
  });

  useEffect(() => {
    if (user && user.role !== "DIRECTEUR" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }

    const loadCourriers = () => {
      const all = getCourriers();
      const àValider = all.filter((c) => c.statut === "EN_ATTENTE_VALIDATION");
      setCourriers(àValider);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    if (selectedCourrier) {
      setFormData({
        décision: "VALIDE",
        observations: "",
      });
    }
  }, [selectedCourrier]);

  const handleValider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourrier) return;

    setLoading(true);
    try {
      let newStatut: Courrier["statut"] = "VALIDE";

      if (formData.décision === "REJETE") {
        newStatut = "ARCHIVE";
      } else if (formData.décision === "RETOUR") {
        newStatut = "EN_CIRCUIT";
      }

      updateCourrier(selectedCourrier.id, {
        statut: newStatut,
        validéPar: user?.id,
        dateValidation: new Date().toISOString(),
        observations: formData.observations,
      });

      addNotification({
        message: `Courrier ${selectedCourrier.ref} ${formData.décision === "VALIDE" ? "validé" : formData.décision === "REJETE" ? "rejeté" : "retourné pour correction"} par ${user?.prenom} ${user?.nom}`,
        niveau: formData.décision === "VALIDE" ? "INFO" : "ALERTE",
        courrierId: selectedCourrier.id,
      });

      alert(`Courrier ${formData.décision === "VALIDE" ? "validé" : formData.décision === "REJETE" ? "rejeté" : "retourné"} avec succès !`);
      setSelectedCourrier(null);

      const all = getCourriers();
      const àValider = all.filter((c) => c.statut === "EN_ATTENTE_VALIDATION");
      setCourriers(àValider);
    } catch (error) {
      alert("Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Validation de courrier</h1>
          <p className="text-slate-600 mt-1">
            Valider, rejeter ou retourner les courriers en attente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Courriers en attente de validation
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courriers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucun courrier en attente de validation
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
                    <div className="font-semibold text-slate-900 mb-1">{courrier.ref}</div>
                    <div className="text-sm text-slate-600 mb-1">{courrier.objet}</div>
                    <div className="text-xs text-slate-500">
                      Service: {courrier.service} | Traité par: {courrier.traitéPar || "N/A"}
                    </div>
                    {courrier.observations && (
                      <div className="text-xs text-slate-400 mt-2 p-2 bg-slate-50 rounded">
                        {courrier.observations}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Formulaire de validation
            </h2>

            {!selectedCourrier ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">✅</div>
                <p>Sélectionnez un courrier à valider</p>
              </div>
            ) : (
              <form onSubmit={handleValider} className="space-y-4">
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
                    <label className="text-xs text-slate-500">Service</label>
                    <div className="text-slate-900">{selectedCourrier.service}</div>
                  </div>
                  {selectedCourrier.observations && (
                    <div>
                      <label className="text-xs text-slate-500">Notes de traitement</label>
                      <div className="text-slate-900 text-sm">{selectedCourrier.observations}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Décision <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.décision}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        décision: e.target.value as "VALIDE" | "REJETE" | "RETOUR",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                  >
                    <option value="VALIDE">✅ Valider</option>
                    <option value="REJETE">❌ Rejeter</option>
                    <option value="RETOUR">↩️ Retourner pour correction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Observations / Justification
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                    placeholder="Justifier votre décision..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                    formData.décision === "VALIDE"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : formData.décision === "REJETE"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
                >
                  {loading
                    ? "Traitement..."
                    : formData.décision === "VALIDE"
                    ? "Valider le courrier"
                    : formData.décision === "REJETE"
                    ? "Rejeter le courrier"
                    : "Retourner pour correction"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

