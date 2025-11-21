"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/context";
import { getCourrierById, updateCourrier } from "@/lib/data";
import { Courrier } from "@/lib/types";
import QRCode from "react-qr-code";
import ChatCourrier from "@/components/ChatCourrier";
import GestionDroits from "@/components/GestionDroits";
import TransfertCourrier from "@/components/TransfertCourrier";
import CourrierTimeline from "@/components/CourrierTimeline";
import Watermark from "@/components/Watermark";
import { getTransferts, getParticipantsCourrier, aAccès } from "@/lib/collaboration";
import { getUserById } from "@/lib/auth";
import { formatDateClient } from "@/lib/utils";

export default function CourrierDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"infos" | "chat" | "droits" | "historique">("infos");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    const loadCourrier = () => {
      const id = params.id as string;
      const found = getCourrierById(id);
      setCourrier(found || null);
      setLoading(false);
    };

    loadCourrier();
    const interval = setInterval(loadCourrier, 2000);
    return () => clearInterval(interval);
  }, [user, router, params]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0051A8] mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courrier) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600">Courrier introuvable</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a]"
          >
            Retour au tableau de bord
          </button>
        </div>
      </Layout>
    );
  }

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verifier?id=${courrier.id}&ref=${encodeURIComponent(courrier.ref)}`
    : `/verifier?id=${courrier.id}&ref=${encodeURIComponent(courrier.ref)}`;

  const qrPayload = verifyUrl;

  const canModifier = user && aAccès(courrier.id, user.id, "ECRITURE");
  const participants = getParticipantsCourrier(courrier.id);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-slate-600 hover:text-slate-900 mb-2"
            >
              ← Retour
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Détails du courrier</h1>
            <p className="text-slate-600 mt-1">Référence : {courrier.ref}</p>
          </div>
        </div>

        {/* Watermark */}
        <Watermark courrierRef={courrier.ref} />

        {/* En-tête avec actions */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{courrier.ref}</h1>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  courrier.statut === "ARCHIVE"
                    ? "bg-slate-100 text-slate-700"
                    : courrier.statut === "VALIDE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {courrier.statut}
              </span>
              {courrier.priorité && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    courrier.priorité === "TRES_URGENTE"
                      ? "bg-red-100 text-red-700"
                      : courrier.priorité === "URGENTE"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {courrier.priorité}
                </span>
              )}
            </div>
            <p className="text-slate-600 mt-1">{courrier.objet}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {courrier.responsableActuel === user?.id && (
              <TransfertCourrier
                courrier={courrier}
                onTransfert={() => {
                  const found = getCourrierById(courrier.id);
                  setCourrier(found || null);
                }}
              />
            )}
            {user && (user.role === "ADMIN" || user.role === "DIRECTEUR" || aAccès(courrier.id, user.id, "PARTAGE")) && (
              <button
                onClick={() => {
                  const found = getCourrierById(courrier.id);
                  if (found) {
                    updateCourrier(found.id, {
                      responsableActuel: user.id,
                    });
                    setCourrier(found);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📌 Prendre en charge
              </button>
            )}
          </div>
        </div>

        {/* Timeline du workflow */}
        <div className="mb-6">
          <CourrierTimeline courrier={courrier} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Colonne principale - Informations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline du workflow */}
            <CourrierTimeline courrier={courrier} />
            {/* Onglets */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-slate-200">
                <nav className="flex -mb-px">
                  {[
                    { id: "infos", label: "📋 Informations", icon: "📋" },
                    { id: "chat", label: "💬 Discussion", icon: "💬" },
                    { id: "droits", label: "🔐 Droits d'accès", icon: "🔐" },
                    { id: "historique", label: "📜 Historique", icon: "📜" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-[#0051A8] text-[#0051A8]"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "infos" && courrier && (
                  <div className="space-y-6">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-slate-500">Type</label>
                        <div className="font-semibold text-slate-900">
                          {courrier.type === "ENTRANT" ? "Courrier entrant" : "Courrier sortant"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Statut</label>
                        <div>
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
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Objet</label>
                        <div className="font-semibold text-slate-900">{courrier.objet}</div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Date</label>
                        <div className="text-slate-900">{courrier.date}</div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">
                          {courrier.type === "ENTRANT" ? "Expéditeur" : "Destinataire"}
                        </label>
                        <div className="text-slate-900">
                          {courrier.type === "ENTRANT" ? courrier.expéditeur : courrier.destinataire}
                        </div>
                      </div>
                      {courrier.service && (
                        <div>
                          <label className="text-xs text-slate-500">Service</label>
                          <div className="text-slate-900">{courrier.service}</div>
                        </div>
                      )}
                      {courrier.priorité && (
                        <div>
                          <label className="text-xs text-slate-500">Priorité</label>
                          <div>
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
                        </div>
                      )}
                    </div>

                    {courrier.observations && (
                      <div className="border-t pt-4">
                        <label className="text-xs text-slate-500">Observations</label>
                        <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-900">
                          {courrier.observations}
                        </div>
                      </div>
                    )}

                    {/* Pièce jointe */}
                    {courrier.pièceJointe && (
                      <div className="border-t pt-4">
                        <label className="text-xs text-slate-500 mb-2 block">Pièce jointe</label>
                        <div className="border rounded-lg p-4 bg-slate-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-900">
                              {courrier.pièceJointe}
                            </span>
                            <a
                              href={`/courrier/${courrier.id}/print`}
                              target="_blank"
                              className="inline-block px-4 py-2 bg-[#0051A8] text-white rounded-lg hover:bg-[#003d7a] text-sm"
                            >
                              Imprimer le document numérisé
                            </a>
                          </div>
                          <div className="h-48 border border-dashed border-slate-300 bg-white flex items-center justify-center text-sm text-slate-500 rounded">
                            Aperçu du document PDF / scanné
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    <div className="border-t pt-4">
                      <label className="text-xs text-slate-500 mb-2 block">Sécurisation par QR code</label>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#0033A0]/5 to-slate-50 rounded-lg border border-[#0033A0]/20">
                        <div className="bg-white p-3 border-2 border-[#0033A0]/30 rounded-lg shadow-sm">
                          <QRCode value={qrPayload} size={120} />
                        </div>
                        <div className="text-sm text-slate-700 flex-1">
                          <p className="font-semibold mb-2 text-[#0033A0]">Vérification d'authenticité</p>
                          <p className="text-xs text-slate-600 mb-2">
                            Scanner ce code avec l'application mobile du ministère pour vérifier l'authenticité du document.
                          </p>
                          <a
                            href={`/verifier?id=${courrier.id}&ref=${encodeURIComponent(courrier.ref)}`}
                            target="_blank"
                            className="text-xs text-[#0033A0] hover:underline font-medium"
                          >
                            → Tester la vérification
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "historique" && courrier && (
                  <div className="space-y-6">
                    {/* Responsable actuel */}
                    {courrier.responsableActuel && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                          Responsable actuel
                        </div>
                        <div className="font-semibold text-blue-900">
                          {(() => {
                            const responsable = getUserById(courrier.responsableActuel || "");
                            return responsable ? `${responsable.prenom} ${responsable.nom} (${responsable.role})` : "N/A";
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Historique des transferts */}
                    {getTransferts(courrier.id).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Historique des transferts</h3>
                        <div className="space-y-3">
                          {getTransferts(courrier.id).map((transfert) => (
                            <div key={transfert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🔄</span>
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900">
                                    {transfert.deUserName} → {transfert.versUserName}
                                  </div>
                                  <div className="text-xs text-slate-600 mt-1">
                                    {formatDateClient(transfert.date)}
                                  </div>
                                </div>
                                <div className="text-xs">
                                  <span className="px-2 py-1 bg-slate-200 rounded">{transfert.statutAvant}</span>
                                  {transfert.statutAprès && (
                                    <>
                                      <span className="mx-2">→</span>
                                      <span className="px-2 py-1 bg-blue-200 rounded">{transfert.statutAprès}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {transfert.raison && (
                                <div className="text-sm text-slate-700 mt-2 p-2 bg-white rounded border border-slate-200">
                                  <strong>Raison :</strong> {transfert.raison}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Historique des actions */}
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Chronologie des actions</h3>
                      <div className="space-y-2 text-sm">
                        {courrier.dateRéception && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">📥 Réception</span>
                            <span className="text-slate-900">
                              {formatDateClient(courrier.dateRéception)}
                            </span>
                          </div>
                        )}
                        {courrier.dateNumérisation && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">📄 Numérisation</span>
                            <span className="text-slate-900">
                              {formatDateClient(courrier.dateNumérisation)}
                            </span>
                          </div>
                        )}
                        {courrier.dateEncodage && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">⌨️ Encodage</span>
                            <span className="text-slate-900">
                              {formatDateClient(courrier.dateEncodage)}
                            </span>
                          </div>
                        )}
                        {courrier.dateTraitement && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">📋 Traitement</span>
                            <span className="text-slate-900">
                              {formatDateClient(courrier.dateTraitement)}
                            </span>
                          </div>
                        )}
                        {courrier.dateValidation && (
                          <div className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-slate-600">✅ Validation</span>
                            <span className="text-slate-900">
                              {formatDateClient(courrier.dateValidation)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    {getParticipantsCourrier(courrier.id).length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Participants</h3>
                        <div className="flex flex-wrap gap-2">
                          {getParticipantsCourrier(courrier.id).map((p) => (
                            <div
                              key={p.id}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                            >
                              {p.prenom} {p.nom} ({p.role})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Collaboration */}
          <div className="space-y-4 sticky top-24 self-start w-full">
            {/* Chat */}
            <div className="bg-white rounded-lg shadow border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">💬 Discussion</h3>
                <button
                  onClick={() => setActiveTab(activeTab === "chat" ? "infos" : "chat")}
                  className="text-xs text-[#0051A8] hover:underline"
                >
                  Ouvrir
                </button>
              </div>
              <div className="p-2">
                <ChatCourrier courrierId={courrier.id} />
              </div>
            </div>

            {/* Droits d'accès */}
            <div className="bg-white rounded-lg shadow border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">🔐 Droits d'accès</h3>
                <button
                  onClick={() => setActiveTab(activeTab === "droits" ? "infos" : "droits")}
                  className="text-xs text-[#0051A8] hover:underline"
                >
                  Gérer
                </button>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <GestionDroits courrierId={courrier.id} />
              </div>
            </div>

            {/* Participants rapide */}
            {participants.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-xs">👥 Participants ({participants.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {participants.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                    >
                      {p.prenom} {p.nom}
                    </div>
                  ))}
                  {participants.length > 5 && (
                    <div className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                      +{participants.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

