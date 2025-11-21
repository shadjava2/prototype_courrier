"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { getCourrierById } from "@/lib/data";
import { Courrier } from "@/lib/types";

function VerifierContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<"authentique" | "inconnu" | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    const ref = searchParams.get("ref");

    if (id || ref) {
      // Simulation de vérification
      setTimeout(() => {
        let found: Courrier | undefined;

        if (id) {
          found = getCourrierById(id);
        } else if (ref) {
          const allCourriers = require("@/lib/data").getCourriers();
          found = allCourriers.find((c: Courrier) => c.ref === ref);
        }

        if (found) {
          setCourrier(found);
          setVerificationResult("authentique");
        } else {
          setVerificationResult("inconnu");
        }
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
      setVerificationResult("inconnu");
    }
  }, [searchParams]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Vérification de document</h1>
          <p className="text-slate-600 mt-1">
            Vérifiez l'authenticité d'un document en scannant son QR code
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0033A0] mx-auto mb-4"></div>
              <p className="text-slate-600">Vérification en cours...</p>
            </div>
          ) : verificationResult === "authentique" && courrier ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">Document authentique</h2>
                <p className="text-slate-600">Ce document a été vérifié et reconnu dans le système.</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 text-left space-y-4">
                <div>
                  <label className="text-xs text-slate-500">Référence</label>
                  <div className="font-semibold text-slate-900 text-lg">{courrier.ref}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Objet</label>
                  <div className="text-slate-900">{courrier.objet}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Type</label>
                    <div className="text-slate-900">
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
                </div>
                <div>
                  <label className="text-xs text-slate-500">Date</label>
                  <div className="text-slate-900">{courrier.date}</div>
                </div>
                {courrier.service && (
                  <div>
                    <label className="text-xs text-slate-500">Service</label>
                    <div className="text-slate-900">{courrier.service}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/courrier/${courrier.id}`)}
                className="px-6 py-3 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-colors font-medium"
              >
                Voir les détails du courrier
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✗</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-700 mb-2">Document non reconnu</h2>
                <p className="text-slate-600">
                  Ce document n'a pas été trouvé dans le système ou les informations fournies sont incorrectes.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Note :</strong> Cette fonctionnalité est en mode simulation. En production, la
                vérification se ferait via une API sécurisée.
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Comment utiliser :</strong> Scannez le QR code présent sur un document de courrier avec
          l'application mobile du ministère pour vérifier son authenticité.
        </div>
      </div>
    </Layout>
  );
}

export default function VerifierPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033A0] mx-auto"></div>
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    }>
      <VerifierContent />
    </Suspense>
  );
}
