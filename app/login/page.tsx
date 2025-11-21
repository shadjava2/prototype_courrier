"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { MOCK_USERS } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Animation de chargement
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(email, password);

    if (success) {
      // Animation de transition avec courrier volant
      const transitionElement = document.createElement("div");
      transitionElement.className = "login-to-dashboard-transition";
      transitionElement.innerHTML = '<div class="courrier-flying">📨</div>';
      document.body.appendChild(transitionElement);

      // Attendre la fin de l'animation
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Nettoyer et rediriger
      transitionElement.remove();
      router.push("/dashboard");
    } else {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    }
  };

  const handleSelectUser = (userEmail: string) => {
    setSelectedUser(userEmail);
    setEmail(userEmail);
    setPassword("demo");
    setError("");
    // Animation de sélection
    setTimeout(() => {
      setSelectedUser(null);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0051A8] via-[#003d7a] to-[#002855] relative overflow-hidden">
      {/* Animations de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FCD116] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#CE1126] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FCD116] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Colonne gauche - Comptes de démonstration avec animations */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 lg:p-12 border-r border-slate-200 relative overflow-hidden">
            {/* Pattern de fond */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="mb-8 animate-fade-in">
                <div className="text-5xl mb-4 animate-bounce-slow">🇨🇩</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Ministère du Transport
                </h2>
                <p className="text-sm text-slate-600">
                  Système de gestion électronique du courrier
                </p>
              </div>

              <div className="animate-slide-in-left">
                <h3 className="text-sm font-semibold text-slate-700 mb-6 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0051A8] rounded-full animate-pulse"></span>
                  Comptes de démonstration
                </h3>
                <div className="space-y-3">
                  {MOCK_USERS.map((user, index) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.email)}
                      className={`w-full text-left p-4 bg-white border-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group ${
                        selectedUser === user.email
                          ? "border-[#0051A8] bg-[#0051A8]/5 shadow-lg scale-105"
                          : "border-slate-200 hover:border-[#0051A8]"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 group-hover:text-[#0051A8] transition-colors flex items-center gap-2">
                            <span className="text-lg">{getRoleIcon(user.role)}</span>
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full">{user.role}</span>
                            <span>•</span>
                            <span>{user.service}</span>
                          </div>
                        </div>
                        <div className={`text-[#0051A8] transition-all ${
                          selectedUser === user.email ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 animate-fade-in">
                <p className="text-xs text-slate-500 mb-1">Prototype - COSOFT & ICT Solutions</p>
                <p className="text-xs text-slate-500">Programme de numérisation 2025–2027</p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Formulaire de connexion avec animations */}
          <div className="p-8 lg:p-12 relative">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-[#0051A8] to-[#003d7a] bg-clip-text text-transparent">
                Connexion
              </h1>
              <p className="text-sm text-slate-600">
                Accédez à votre espace de travail sécurisé
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-in-right">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <span>📧</span>
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full px-4 py-3 pl-12 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0051A8] focus:border-[#0051A8] outline-none transition-all duration-200 hover:border-slate-400"
                    placeholder="votre.email@transport.rdc"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.001 8.001 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <span>🔒</span>
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full px-4 py-3 pl-12 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0051A8] focus:border-[#0051A8] outline-none transition-all duration-200 hover:border-slate-400"
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0051A8] to-[#003d7a] text-white py-4 rounded-xl font-semibold hover:from-[#003d7a] hover:to-[#002855] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center animate-fade-in">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>💡</span>
                Cliquez sur un compte de démonstration à gauche pour remplir automatiquement le formulaire
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes loginToDashboard {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          50% {
            opacity: 1;
            transform: scale(1.1) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: scale(1.2) translateY(-50px);
          }
        }
        .login-to-dashboard-transition {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: linear-gradient(135deg, #0033A0 0%, #FFD200 50%, #0033A0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: loginToDashboard 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .login-to-dashboard-transition::before {
          content: "📨";
          font-size: 80px;
          animation: floatCourrier 0.6s ease-in-out;
        }
        @keyframes floatCourrier {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(15deg);
          }
          100% {
            transform: translateY(-60px) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}

function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    RECEPTIONNISTE: "📥",
    AGENT: "👤",
    DIRECTEUR: "👔",
    ADMIN: "⚙️",
    VISITEUR: "👁️",
  };
  return icons[role] || "👤";
}
