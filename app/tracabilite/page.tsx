"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourriers } from "@/lib/data";
import { Courrier } from "@/lib/types";
import Link from "next/link";

interface ConsultationLog {
  id: string;
  courrierId: string;
  courrierRef: string;
  utilisateur: string;
  role: string;
  action: string;
  date: string;
}

export default function TracabilitePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ConsultationLog[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Simulation de journaux d'accès
    const generateLogs = () => {
      const courriers = getCourriers();
      const mockLogs: ConsultationLog[] = [];

      courriers.slice(0, 20).forEach((courrier, index) => {
        const actions = ["Consultation", "Modification", "Téléchargement", "Impression"];
        const utilisateurs = [
          { nom: "Jean", role: "AGENT" },
          { nom: "Marie", role: "DIRECTEUR" },
          { nom: "Paul", role: "RECEPTIONNISTE" },
        ];

        const utilisateur = utilisateurs[index % utilisateurs.length];
        const date = new Date(Date.now() - index * 60 * 60 * 1000);

        mockLogs.push({
          id: `log-${index}`,
          courrierId: courrier.id,
          courrierRef: courrier.ref,
          utilisateur: utilisateur.nom,
          role: utilisateur.role,
          action: actions[index % actions.length],
          date: date.toISOString(),
        });
      });

      setLogs(mockLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    generateLogs();
    const interval = setInterval(generateLogs, 10000);
    return () => clearInterval(interval);
  }, [user, router]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Traçabilité & Sécurité</h1>
          <p className="text-slate-600 mt-1">Journaux d'accès et vérification de documents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Vérification QR Code</h3>
            <p className="text-sm text-slate-600 mb-4">
              Vérifiez l'authenticité d'un document en scannant son QR code.
            </p>
            <Link
              href="/verifier"
              className="inline-block px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-colors text-sm font-medium"
            >
              Vérifier un document
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Total consultations</h3>
            <div className="text-3xl font-bold text-[#0033A0]">{logs.length}</div>
            <p className="text-xs text-slate-500 mt-1">Dernières 24 heures</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Actions récentes</h3>
            <div className="text-3xl font-bold text-[#0033A0]">
              {logs.filter((l) => new Date(l.date).getTime() > Date.now() - 3600000).length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Dernière heure</p>
          </div>
        </div>

        {/* Journaux d'accès */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Journaux d'accès récents</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Courrier</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Rôle</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(log.date).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/courrier/${log.courrierId}`}
                          className="text-[#0033A0] hover:underline font-medium"
                        >
                          {log.courrierRef}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-900">{log.utilisateur}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          {log.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            log.action === "Consultation"
                              ? "bg-blue-100 text-blue-700"
                              : log.action === "Modification"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
