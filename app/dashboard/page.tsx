"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers, getNotifications } from "@/lib/data";
import { Courrier, AINotification } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [notifications, setNotifications] = useState<AINotification[]>([]);
  const [stats, setStats] = useState({
    entrants: 0,
    sortants: 0,
    enAttente: 0,
    validés: 0,
    archivés: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadData = () => {
      const allCourriers = getCourriers();
      setCourriers(allCourriers);

      const entrants = allCourriers.filter((c) => c.type === "ENTRANT");
      const sortants = allCourriers.filter((c) => c.type === "SORTANT");
      const enAttente = allCourriers.filter(
        (c) => c.statut === "EN_CIRCUIT" || c.statut === "EN_ATTENTE_VALIDATION"
      );
      const validés = allCourriers.filter((c) => c.statut === "VALIDE");
      const archivés = allCourriers.filter((c) => c.statut === "ARCHIVE");

      setStats({
        entrants: entrants.length,
        sortants: sortants.length,
        enAttente: enAttente.length,
        validés: validés.length,
        archivés: archivés.length,
      });

      setNotifications(getNotifications(user?.id));
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user, router]);

  const libelleStatut = (statut: string) => {
    const statuts: Record<string, string> = {
      RECU: "Reçu",
      NUMERISE: "Numérisé",
      EN_CIRCUIT: "En circuit",
      EN_ATTENTE_VALIDATION: "En attente",
      VALIDE: "Validé",
      REPONDU: "Répondu",
      ARCHIVE: "Archivé",
    };
    return statuts[statut] || statut;
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in dashboard-enter">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tableau de bord
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bienvenue, <span className="font-medium text-slate-700">{user?.prenom} {user?.nom}</span>
          </p>
        </div>

        {/* Statistiques KPI enrichies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: "Courriers entrants",
              value: stats.entrants,
              icon: "📥",
              borderColor: "#0033A0",
              dotColor: "#0033A0",
              delay: 0,
              trend: "+12% vs mois précédent",
              trendColor: "text-emerald-600",
              sparkline: "bg-blue-200"
            },
            {
              label: "Courriers sortants",
              value: stats.sortants,
              icon: "📤",
              borderColor: "#10b981",
              dotColor: "#10b981",
              delay: 100,
              trend: "+8% vs mois précédent",
              trendColor: "text-emerald-600",
              sparkline: "bg-emerald-200"
            },
            {
              label: "En attente",
              value: stats.enAttente,
              icon: "⏳",
              borderColor: "#FFD200",
              dotColor: "#FFD200",
              delay: 200,
              trend: "Retard moyen : 2j",
              trendColor: "text-amber-600",
              sparkline: "bg-amber-200"
            },
            {
              label: "Validés",
              value: stats.validés,
              icon: "✅",
              borderColor: "#10b981",
              dotColor: "#10b981",
              delay: 300,
              trend: "+15% vs mois précédent",
              trendColor: "text-emerald-600",
              sparkline: "bg-emerald-200"
            },
            {
              label: "Archivés",
              value: stats.archivés,
              icon: "📦",
              borderColor: "#64748b",
              dotColor: "#64748b",
              delay: 400,
              trend: "Total archivé",
              trendColor: "text-slate-600",
              sparkline: "bg-slate-200"
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-4 sm:p-5 hover:border-[#0033A0]/40 hover:shadow-modern-lg hover:shadow-[#0033A0]/10 transition-all animate-slide-in transform hover:-translate-y-1 hover:scale-[1.02]"
              style={{
                borderLeft: `4px solid ${stat.borderColor}`,
                animationDelay: `${stat.delay}ms`,
                boxShadow: `0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl filter drop-shadow-sm">{stat.icon}</div>
                <div className="w-3 h-3 rounded-full animate-pulse shadow-md" style={{ backgroundColor: stat.dotColor, boxShadow: `0 0 8px ${stat.dotColor}40` }}></div>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mb-1">{stat.label}</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0033A0] mb-2">{stat.value}</div>
              {/* Micro-barre graphique (sparkline) */}
              <div className="flex items-end gap-0.5 h-8 mb-2">
                {[65, 70, 68, 75, 72, 78, stat.value].map((val, idx) => {
                  const max = Math.max(78, stat.value);
                  const height = (val / max) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-[#0033A0] to-[#002280] rounded-t hover:from-[#0033A0] hover:to-[#0040CC] transition-all shadow-sm hover:shadow-[#0033A0]/50"
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${val}`}
                    ></div>
                  );
                })}
              </div>
              <div className={`text-xs font-medium ${stat.trendColor === "text-emerald-600" ? "text-emerald-600" : stat.trendColor === "text-amber-600" ? "text-[#FFD200]" : "text-slate-500"}`}>{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Assistant IA - Résumé */}
        <div className="bg-gradient-to-r from-[#0033A0] via-[#002280] to-[#0033A0] backdrop-blur-sm rounded-xl border border-[#0033A0]/30 p-5 text-white mb-6 shadow-modern-xl hover:shadow-colored transition-all transform hover:scale-[1.01] animate-slide-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD200]/10 to-transparent opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl filter drop-shadow-md">🤖</span>
              <h2 className="text-lg font-semibold text-white">Assistant numérique</h2>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Votre assistant IA analyse les courriers et vous propose des recommandations en temps réel.
            </p>
            <Link
              href="/assistant-ia"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD200] to-[#FFE066] text-[#0033A0] rounded-lg hover:from-[#FFE066] hover:to-[#FFD200] transition-all text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-[#FFD200]/40 transform hover:scale-105 active:scale-95"
            >
              Voir toutes les suggestions
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Notifications */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-modern-lg hover:shadow-modern-xl hover:shadow-[#0033A0]/10 transition-all animate-slide-in">
            <h2 className="text-lg font-semibold text-[#0033A0] mb-4">
              Notifications & Alertes
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-sm text-slate-500">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border backdrop-blur-sm transition-all animate-slide-in ${
                      notif.niveau === "ALERTE"
                        ? "bg-gradient-to-r from-red-50 to-red-100/50 border-red-200 text-red-800 shadow-sm shadow-red-200/50"
                        : "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 text-blue-800 shadow-sm shadow-blue-200/50"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl filter drop-shadow-sm">{notif.niveau === "ALERTE" ? "⚠️" : "ℹ️"}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">{notif.message}</div>
                        <div className="text-xs opacity-75 text-slate-600">
                          {new Date(notif.date).toLocaleString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Courriers récents */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-modern-lg hover:shadow-modern-xl hover:shadow-[#0033A0]/10 transition-all animate-slide-in">
            <h2 className="text-lg font-semibold text-[#0033A0] mb-4">
              Courriers récents
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {courriers.slice(0, 10).map((courrier, index) => (
                <Link
                  key={courrier.id}
                  href={`/courrier/${courrier.id}`}
                  className="block p-3 border border-slate-200/60 rounded-lg hover:border-[#0033A0]/40 hover:bg-gradient-to-r hover:from-[#0033A0]/5 hover:to-[#FFD200]/5 transition-all animate-slide-in bg-white/50 backdrop-blur-sm hover:shadow-md hover:shadow-[#0033A0]/10 transform hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-[#0033A0] text-lg">{courrier.ref}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm border ${
                        courrier.statut === "ARCHIVE"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : courrier.statut === "VALIDE"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-amber-100 text-amber-700 border-amber-200"
                      }`}
                    >
                      {libelleStatut(courrier.statut)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 mb-2">{courrier.objet}</div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {courrier.service && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm border ${
                        courrier.service === "Cabinet" ? "bg-purple-100 text-purple-700 border-purple-200" :
                        courrier.service === "Secrétariat Général" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        courrier.service === "Inspection" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {courrier.service}
                      </span>
                    )}
                    {(courrier.priorité === "URGENTE" || courrier.priorité === "TRES_URGENTE") && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium border border-red-200 backdrop-blur-sm">
                        {courrier.priorité === "TRES_URGENTE" ? "🔴 Très urgent" : "⚠️ Urgent"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {courrier.type === "ENTRANT" ? "De" : "À"}:{" "}
                    {courrier.type === "ENTRANT"
                      ? courrier.expéditeur
                      : courrier.destinataire}
                    {courrier.date && ` • ${new Date(courrier.date).toLocaleDateString("fr-FR")}`}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

