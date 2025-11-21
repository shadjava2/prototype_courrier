"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";

export default function RapportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEntrants: 0,
    totalSortants: 0,
    tauxValidation: 0,
    delaiMoyen: 0,
    courriersUrgents: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const calculateStats = () => {
      const courriers = getCourriers();
      const entrants = courriers.filter((c) => c.type === "ENTRANT");
      const sortants = courriers.filter((c) => c.type === "SORTANT");
      const valides = courriers.filter((c) => c.statut === "VALIDE");
      const urgents = courriers.filter(
        (c) => c.priorité === "URGENTE" || c.priorité === "TRES_URGENTE"
      );

      const courriersAvecDelai = courriers.filter(
        (c) => c.dateRéception && c.dateTraitement
      );
      const delais = courriersAvecDelai.map((c) => {
        const reception = new Date(c.dateRéception!);
        const traitement = new Date(c.dateTraitement!);
        return Math.floor((traitement.getTime() - reception.getTime()) / (1000 * 60 * 60 * 24));
      });
      const delaiMoyen =
        delais.length > 0 ? delais.reduce((a, b) => a + b, 0) / delais.length : 0;

      setStats({
        totalEntrants: entrants.length,
        totalSortants: sortants.length,
        tauxValidation: courriers.length > 0 ? (valides.length / courriers.length) * 100 : 0,
        delaiMoyen: Math.round(delaiMoyen * 10) / 10,
        courriersUrgents: urgents.length,
      });
    };

    calculateStats();
    const interval = setInterval(calculateStats, 5000);
    return () => clearInterval(interval);
  }, [user, router]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Rapports & Analytics</h1>
          <p className="text-slate-600 mt-1">Statistiques et analyses de la gestion de courrier</p>
        </div>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm text-slate-600 mb-1">Courriers entrants</div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalEntrants}</div>
            <div className="text-xs text-green-600 mt-2">+12% vs mois précédent</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-slate-600 mb-1">Courriers sortants</div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalSortants}</div>
            <div className="text-xs text-green-600 mt-2">+8% vs mois précédent</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <div className="text-sm text-slate-600 mb-1">Taux de validation</div>
            <div className="text-3xl font-bold text-slate-900">{stats.tauxValidation.toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-2">Courriers validés</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="text-sm text-slate-600 mb-1">Délai moyen</div>
            <div className="text-3xl font-bold text-slate-900">{stats.delaiMoyen}j</div>
            <div className="text-xs text-red-600 mt-2">Retard moyen: 2j</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-sm text-slate-600 mb-1">Courriers urgents</div>
            <div className="text-3xl font-bold text-slate-900">{stats.courriersUrgents}</div>
            <div className="text-xs text-amber-600 mt-2">En attente de traitement</div>
          </div>
        </div>

        {/* Graphiques simulés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition par service</h3>
            <div className="space-y-3">
              {["Cabinet", "Secrétariat Général", "Inspection", "Direction des Transports"].map(
                (service) => {
                  const count = getCourriers().filter((c) => c.service === service).length;
                  const percentage = (count / stats.totalEntrants) * 100 || 0;
                  return (
                    <div key={service}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{service}</span>
                        <span className="text-slate-900 font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-[#0033A0] h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Évolution mensuelle</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {[65, 72, 68, 80, 75, 85, 90].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-[#0033A0] rounded-t transition-all hover:bg-[#002280]"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-slate-500 mt-2">M{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
