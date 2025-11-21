"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, addCourrier, updateCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function SortantsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourrierEntrant, setSelectedCourrierEntrant] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    objet: "",
    destinataire: "",
    service: "",
    liéÀ: "",
    observations: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadCourriers = () => {
      const all = getCourriers();
      const sortants = all.filter((c) => c.type === "SORTANT");
      setCourriers(sortants);
    };

    loadCourriers();
    const interval = setInterval(loadCourriers, 2000);
    return () => clearInterval(interval);
  }, [user, router]);

  const handleCreateSortant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCourrier = addCourrier({
        type: "SORTANT",
        objet: formData.objet,
        expéditeur: "Ministère du Transport, Voies de Communication et Désenclavement",
        destinataire: formData.destinataire,
        date: new Date().toISOString().split("T")[0],
        statut: "EN_ATTENTE_VALIDATION",
        service: formData.service,
        liéÀ: formData.liéÀ || undefined,
        observations: formData.observations,
        dateRéception: new Date().toISOString(),
        priorité: "NORMALE",
      });

      addNotification({
        message: `Nouveau courrier sortant créé : ${newCourrier.ref}`,
        niveau: "INFO",
        courrierId: newCourrier.id,
      });

      alert(`Courrier sortant créé avec succès !\nRéférence : ${newCourrier.ref}`);

      setFormData({
        objet: "",
        destinataire: "",
        service: "",
        liéÀ: "",
        observations: "",
      });
      setShowForm(false);
      setSelectedCourrierEntrant(null);
    } catch (error) {
      alert("Erreur lors de la création du courrier sortant");
    } finally {
      setLoading(false);
    }
  };

  const courriersEntrants = getCourriers().filter((c) => c.type === "ENTRANT" && c.statut === "VALIDE");

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Courriers sortants</h1>
            <p className="text-slate-600 mt-1">
              Gérer les courriers sortants et créer des réponses
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors font-medium"
          >
            {showForm ? "Annuler" : "+ Nouveau courrier sortant"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Créer un courrier sortant
            </h2>
            <form onSubmit={handleCreateSortant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Objet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.objet}
                    onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                    placeholder="Ex: Réponse à la demande d'agrément..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Destinataire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destinataire}
                    onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                    placeholder="Ex: Société UZALENDO SARL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service émetteur <span className="text-red-500">*</span>
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
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lier à un courrier entrant (optionnel)
                  </label>
                  <select
                    value={formData.liéÀ}
                    onChange={(e) => {
                      setFormData({ ...formData, liéÀ: e.target.value });
                      const courrier = courriersEntrants.find((c) => c.id === e.target.value);
                      setSelectedCourrierEntrant(courrier || null);
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                  >
                    <option value="">Aucun (courrier indépendant)</option>
                    {courriersEntrants.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ref} - {c.objet}
                      </option>
                    ))}
                  </select>
                  {selectedCourrierEntrant && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <strong>Courrier lié :</strong> {selectedCourrierEntrant.ref} - {selectedCourrierEntrant.objet}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Observations / Contenu
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                    placeholder="Résumé du contenu du courrier..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Création..." : "Créer le courrier sortant"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      objet: "",
                      destinataire: "",
                      service: "",
                      liéÀ: "",
                      observations: "",
                    });
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Liste des courriers sortants
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {courriers.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Aucun courrier sortant enregistré
              </p>
            ) : (
              courriers.map((courrier) => (
                <div
                  key={courrier.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-[#0051A8] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-900">{courrier.ref}</span>
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
                  <div className="text-sm text-slate-600 mb-1">{courrier.objet}</div>
                  <div className="text-xs text-slate-500">
                    À: {courrier.destinataire} | Service: {courrier.service}
                  </div>
                  {courrier.liéÀ && (
                    <div className="text-xs text-blue-600 mt-1">
                      Réponse au courrier {courrier.liéÀ}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

