"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, User } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { usePlayerName, setPlayerName } from "@/hooks/usePlayerName";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup" | "profile";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>("profile");
  const currentPlayerName = usePlayerName();
  const [playerName, setInputPlayerName] = useState(currentPlayerName);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, signUp, signIn, signOut, updateProfile } = useAuth();

  useEffect(() => {
    if (user) {
      setMode("profile");
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [user]);

  const handleSaveName = async () => {
    if (playerName.trim()) {
      setPlayerName(playerName);
      await updateProfile({ displayName: playerName });
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signUp(email, password, playerName);
    if (err) setError(err);
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setEmail("");
    setPassword("");
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-t-3xl border border-black/[0.05] bg-white p-6 shadow-card-hover sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold leading-snug text-ink">
                {mode === "login" ? "Connexion" : "Inscription"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="btn-tap flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] bg-background text-ink-soft active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 flex rounded-full border border-black/[0.06] bg-background p-1">
              <button
                type="button"
                onClick={() => setMode("profile")}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  mode === "profile" ? "bg-secondary text-white shadow-btn-secondary" : "text-ink-soft"
                )}
              >
                Profil
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  mode === "login" ? "bg-secondary text-white shadow-btn-secondary" : "text-ink-soft"
                )}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  mode === "signup" ? "bg-secondary text-white shadow-btn-secondary" : "text-ink-soft"
                )}
              >
                Inscription
              </button>
            </div>

            {mode === "profile" ? (
              <form className="flex flex-col gap-3" onSubmit={(e) => {
                e.preventDefault();
                handleSaveName();
              }}>
                <label className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-background px-4 py-3">
                  <User className="h-4 w-4 shrink-0 text-ink-faint" />
                  <input
                    type="text"
                    placeholder="Ton pseudo"
                    autoComplete="nickname"
                    value={playerName}
                    onChange={(e) => setInputPlayerName(e.target.value)}
                    className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                </label>
                {user && (
                  <p className="text-xs text-ink-faint">Connecté en tant que {user.email}</p>
                )}
                <NeonButton type="submit" variant="secondary" size="lg" className="mt-2 w-full">
                  Enregistrer
                </NeonButton>
                {user && (
                  <NeonButton
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="mt-2 w-full"
                    onClick={handleSignOut}
                    disabled={loading}
                  >
                    Déconnexion
                  </NeonButton>
                )}
              </form>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={mode === "signup" ? handleSignUp : handleSignIn}>
                {mode === "signup" && (
                  <label className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-background px-4 py-3">
                    <User className="h-4 w-4 shrink-0 text-ink-faint" />
                    <input
                      type="text"
                      placeholder="Pseudo"
                      autoComplete="nickname"
                      value={playerName}
                      onChange={(e) => setInputPlayerName(e.target.value)}
                      className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                    />
                  </label>
                )}
                <label className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-background px-4 py-3">
                  <Mail className="h-4 w-4 shrink-0 text-ink-faint" />
                  <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-background px-4 py-3">
                  <Lock className="h-4 w-4 shrink-0 text-ink-faint" />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                </label>

                {error && <p className="text-xs text-danger">{error}</p>}

                <NeonButton type="submit" variant="secondary" size="lg" className="mt-2 w-full" disabled={loading}>
                  {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
                </NeonButton>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
