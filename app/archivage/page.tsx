"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, updateCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function ArchivagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [selectedCourrier, setSelectedCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtre, setFiltre] = useState<"TOUS" | "A_ARCHIVER" | "ARCHIVES">("A_ARCHIVER");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const loadCourriers = () => {
      const all = getCourriers();
      let filtered: Courrier[] = [];

      if (filtre === "A_ARCHIVER") {
        filtered = all.filter((c) => c.statut === "VALIDE" || c.statut === "REPONDU");
      } else if (filtre === "ARCHIVES") {
        filtered = all.filter((c) => c.statut === "ARCHIVE");
      } else {
        filtered = all;
      }

      setCourriers(filtered);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router, filtre]);

  const handleArchiver = async () => {
    if (!selectedCourrier) return;

    setLoading(true);
    try {
      updateCourrier(selectedCourrier.id, {
        statut: "ARCHIVE",
      });

      addNotification({
        message: `Courrier ${selectedCourrier.ref} archivé`,
        niveau: "INFO",
        courrierId: selectedCourrier.id,
      });

      alert("Courrier archivé avec succès !");
      setSelectedCourrier(null);

      const all = getCourriers();
      const àArchiver = all.filter((c) => c.statut === "VALIDE" || c.statut === "REPONDU");
      setCourriers(àArchiver);
    } catch (error) {
      alert("Erreur lors de l'archivage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Archivage de courrier</h1>
          <p className="text-slate-600 mt-1">
            Archiver les courriers traités et validés
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFiltre("A_ARCHIVER")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtre === "A_ARCHIVER"
                ? "bg-[#0051A8] text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            À archiver
          </button>
          <button
            onClick={() => setFiltre("ARCHIVES")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtre === "ARCHIVES"
                ? "bg-[#0051A8] text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Archives
          </button>
          <button
            onClick={() => setFiltre("TOUS")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtre === "TOUS"
                ? "bg-[#0051A8] text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Tous
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {filtre === "A_ARCHIVER" ? "Courriers à archiver" : filtre === "ARCHIVES" ? "Courriers archivés" : "Tous les courriers"}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {courriers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Aucun courrier trouvé
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
                      {courrier.type === "ENTRANT" ? "De" : "À"}:{" "}
                      {courrier.type === "ENTRANT" ? courrier.expéditeur : courrier.destinataire}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Date: {courrier.date}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Détails du courrier
            </h2>

            {!selectedCourrier ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-4">📦</div>
                <p>Sélectionnez un courrier</p>
              </div>
            ) : (
              <div className="space-y-4">
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
                    <label className="text-xs text-slate-500">Type</label>
                    <div className="text-slate-900">
                      {selectedCourrier.type === "ENTRANT" ? "Courrier entrant" : "Courrier sortant"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Statut</label>
                    <div className="text-slate-900">{selectedCourrier.statut}</div>
                  </div>
                </div>

                {selectedCourrier.statut !== "ARCHIVE" && (
                  <div className="pt-4 border-t">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-amber-800">
                        <strong>Attention :</strong> L'archivage est définitif. Le courrier sera marqué comme archivé et ne pourra plus être modifié.
                      </p>
                    </div>

                    <button
                      onClick={handleArchiver}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Archivage..." : "Archiver le courrier"}
                    </button>
                  </div>
                )}

                {selectedCourrier.statut === "ARCHIVE" && (
                  <div className="pt-4 border-t">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>✓</strong> Ce courrier est déjà archivé.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

