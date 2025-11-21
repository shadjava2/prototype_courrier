"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, updateCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function EncodagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service: "",
    observations: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const loadCourriers = () => {
      const all = getCourriers();
      const àEncoder = all.filter((c) => c.statut === "NUMERISE" && c.type === "ENTRANT");
      setCourriers(àEncoder);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router]);

  useEffect(() => {
    if (selectedCourrier) {
      setFormData({
        service: selectedCourrier.service || "",
        observations: selectedCourrier.observations || "",
      });
    }
  }, [selectedCourrier]);

  const handleEncoder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourrier) return;

    setLoading(true);
    try {
      updateCourrier(selectedCourrier.id, {
        statut: "EN_CIRCUIT",
        encodéPar: user?.id,
        dateEncodage: new Date().toISOString(),
        service: formData.service,
        observations: formData.observations,
      });

      addNotification({
        message: `Courrier ${selectedCourrier.ref} encodé et affecté au service ${formData.service}`,
        niveau: "INFO",
        courrierId: selectedCourrier.id,
      });

      alert("Courrier encodé avec succès !");
      setSelectedCourrier(null);

      const all = getCourriers();
      const àEncoder = all.filter((c) => c.statut === "NUMERISE" && c.type === "ENTRANT");
      setCourriers(àEncoder);
    } catch (error) {
      alert("Erreur lors de l'encodage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Encodage de courrier</h1>
          <p className="text-slate-600 mt-1">
            Compléter les informations et affecter le courrier à un service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Courriers à encoder
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courriers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucun courrier en attente d'encodage
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
                    <div className="text-sm text-slate-600">{courrier.objet}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      De: {courrier.expéditeur}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Formulaire d'encodage
            </h2>

            {!selectedCourrier ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">⌨️</div>
                <p>Sélectionnez un courrier à encoder</p>
              </div>
            ) : (
              <form onSubmit={handleEncoder} className="space-y-4">
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
                    Service en charge <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                  >
                    <option value="">Sélectionner un service</option>
                    <option value="Cabinet">Cabinet</option>
                    <option value="Secrétariat Général">Secrétariat Général</option>
                    <option value="Direction du Travail">Direction du Travail</option>
                    <option value="Direction de l'Emploi">Direction de l'Emploi</option>
                    <option value="Direction de la Prévoyance Sociale">Direction de la Prévoyance Sociale</option>
                    <option value="Archives">Archives</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Observations / Notes
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                    placeholder="Notes additionnelles..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Encodage..." : "Encoder et affecter au service"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

