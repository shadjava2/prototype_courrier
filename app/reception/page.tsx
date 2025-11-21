"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { addCourrier, addNotification } from "@/lib/data";
import { Courrier } from "@/lib/types";

export default function ReceptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    objet: "",
    expéditeur: "",
    destinataire: "",
    service: "",
    priorité: "NORMALE" as "NORMALE" | "URGENTE" | "TRES_URGENTE",
    observations: "",
  });

  useEffect(() => {
    if (user && user.role !== "RECEPTIONNISTE" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || (user.role !== "RECEPTIONNISTE" && user.role !== "ADMIN")) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCourrier = addCourrier({
        type: "ENTRANT",
        objet: formData.objet,
        expéditeur: formData.expéditeur,
        destinataire: formData.destinataire,
        date: new Date().toISOString().split("T")[0],
        statut: "RECU",
        service: formData.service,
        priorité: formData.priorité,
        observations: formData.observations,
        dateRéception: new Date().toISOString(),
      });

      addNotification({
        message: `Nouveau courrier reçu : ${newCourrier.ref} - ${newCourrier.objet}`,
        niveau: "INFO",
        courrierId: newCourrier.id,
      });

      alert(`Courrier enregistré avec succès !\nRéférence : ${newCourrier.ref}`);

      setFormData({
        objet: "",
        expéditeur: "",
        destinataire: "",
        service: "",
        priorité: "NORMALE",
        observations: "",
      });
    } catch (error) {
      alert("Erreur lors de l'enregistrement du courrier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Réception de courrier</h1>
          <p className="text-slate-600 mt-1">
            Enregistrer un nouveau courrier entrant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Objet du courrier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.objet}
                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                placeholder="Ex: Demande d'agrément d'une société de sécurité"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expéditeur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.expéditeur}
                onChange={(e) => setFormData({ ...formData, expéditeur: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                placeholder="Ex: Société UZALENDO SARL"
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
                placeholder="Ex: Cabinet du Ministre"
              />
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
                Priorité <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.priorité}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priorité: e.target.value as "NORMALE" | "URGENTE" | "TRES_URGENTE",
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
              >
                <option value="NORMALE">Normale</option>
                <option value="URGENTE">Urgente</option>
                <option value="TRES_URGENTE">Très urgente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observations
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0051A8] focus:border-transparent outline-none"
                placeholder="Notes additionnelles sur le courrier..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Enregistrement..." : "Enregistrer le courrier"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

