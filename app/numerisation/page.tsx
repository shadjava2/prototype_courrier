"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, updateCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function NumerisationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== "RECEPTIONNISTE" && user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    const loadCourriers = () => {
      const all = getCourriers();
      const àNumériser = all.filter((c) => c.statut === "RECU" && c.type === "ENTRANT");
      setCourriers(àNumériser);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router]);

  const handleNumeriser = async () => {
    if (!selectedCourrier) return;

    setLoading(true);
    try {
      updateCourrier(selectedCourrier.id, {
        statut: "NUMERISE",
        numériséPar: user?.id,
        dateNumérisation: new Date().toISOString(),
        pièceJointe: `scan/${selectedCourrier.id}.pdf`,
      });

      addNotification({
        message: `Courrier ${selectedCourrier.ref} numérisé avec succès`,
        niveau: "INFO",
        courrierId: selectedCourrier.id,
      });

      alert("Courrier numérisé avec succès !");
      setSelectedCourrier(null);

      // Recharger la liste
      const all = getCourriers();
      const àNumériser = all.filter((c) => c.statut === "RECU" && c.type === "ENTRANT");
      setCourriers(àNumériser);
    } catch (error) {
      alert("Erreur lors de la numérisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Numérisation de courrier</h1>
          <p className="text-slate-600 mt-1">
            Sélectionner un courrier reçu pour le numériser
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des courriers à numériser */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Courriers en attente de numérisation
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courriers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucun courrier en attente de numérisation
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
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          courrier.priorité === "TRES_URGENTE"
                            ? "bg-red-100 text-red-700"
                            : courrier.priorité === "URGENTE"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {courrier.priorité}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-1">{courrier.objet}</div>
                    <div className="text-xs text-slate-500">
                      De: {courrier.expéditeur} | Service: {courrier.service}
                    </div>
                    {courrier.dateRéception && (
                      <div className="text-xs text-slate-400 mt-1">
                        Reçu le: {new Date(courrier.dateRéception).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Détails et action */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Détails du courrier
            </h2>

            {!selectedCourrier ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">📄</div>
                <p>Sélectionnez un courrier à numériser</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
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
                  <div>
                    <label className="text-xs text-slate-500">Destinataire</label>
                    <div className="text-slate-900">{selectedCourrier.destinataire}</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Service</label>
                    <div className="text-slate-900">{selectedCourrier.service}</div>
                  </div>
                  {selectedCourrier.observations && (
                    <div>
                      <label className="text-xs text-slate-500">Observations</label>
                      <div className="text-slate-900">{selectedCourrier.observations}</div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Instructions :</strong> Après avoir scanné le document physique,
                      cliquez sur "Marquer comme numérisé" pour passer à l'étape suivante.
                    </p>
                  </div>

                  <button
                    onClick={handleNumeriser}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? "Traitement..." : "Marquer comme numérisé"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

