"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, User } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { usePlayerName, setPlayerName } from "@/hooks/usePlayerName";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup" | "profile" | "reset";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>("profile");
  const currentPlayerName = usePlayerName();
  const [playerName, setInputPlayerName] = useState(currentPlayerName);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, signUp, signIn, signOut, updateProfile, resetPassword } = useAuth();

  useEffect(() => {
    if (user) {
      setMode("profile");
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [user]);

  // Les messages ne doivent pas survivre a un changement d'onglet.
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Renseigne ton email.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    // Message volontairement neutre : confirmer qu'un compte existe pour cet
    // email permettrait d'enumerer les comptes inscrits.
    setSuccess("Si un compte existe pour cet email, un lien vient d'etre envoye.");
  };

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
    setSuccess("");
    setLoading(true);
    const { error: err, needsConfirmation } = await signUp(email, password, playerName);
    if (err) setError(err);
    else if (needsConfirmation) {
      setSuccess("Compte cree ! Confirme ton email pour te connecter (verifie tes spams).");
    }
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
            className="relative w-full max-w-sm rounded-t-3xl border border-line bg-background-card p-6 shadow-strong sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold leading-snug text-ink">
                {mode === "profile"
                  ? "Profil"
                  : mode === "login"
                    ? "Connexion"
                    : mode === "signup"
                      ? "Inscription"
                      : "Mot de passe oublie"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="btn-tap flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-sunken text-ink-soft hover:border-primary active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 flex rounded-full border border-line bg-background-sunken p-1">
              <button
                type="button"
                onClick={() => setMode("profile")}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  mode === "profile" ? "bg-primary text-ink-accent shadow-subtle" : "text-ink-soft"
                )}
              >
                Profil
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  mode === "login" ? "bg-primary text-ink-accent shadow-subtle" : "text-ink-soft"
                )}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                  mode === "signup" ? "bg-primary text-ink-accent shadow-subtle" : "text-ink-soft"
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
                <label className="flex items-center gap-3 rounded-sm border border-line bg-background-sunken px-4 py-3 focus-within:border-primary">
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
                <NeonButton type="submit" variant="primary" size="lg" className="mt-2 w-full">
                  Enregistrer
                </NeonButton>
                {user && (
                  <>
                    <Link href="/profile" onClick={onClose} className="w-full">
                      <NeonButton type="button" variant="ghost" size="lg" className="w-full">
                        Mon profil & statistiques
                      </NeonButton>
                    </Link>
                    <NeonButton
                      type="button"
                      variant="primary"
                      size="lg"
                      className="mt-2 w-full"
                      onClick={handleSignOut}
                      disabled={loading}
                    >
                      Déconnexion
                    </NeonButton>
                  </>
                )}
              </form>
            ) : mode === "reset" ? (
              <form className="flex flex-col gap-3" onSubmit={handleResetPassword}>
                <p className="text-xs text-ink-soft">
                  Entre ton email : tu recevras un lien pour choisir un nouveau mot de passe.
                </p>
                <label className="flex items-center gap-3 rounded-sm border border-line bg-background-sunken px-4 py-3 focus-within:border-primary">
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

                {error && <p className="text-xs text-danger">{error}</p>}
                {success && <p className="text-xs text-success">{success}</p>}

                <NeonButton type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={loading}>
                  {loading ? "Envoi..." : "Envoyer le lien"}
                </NeonButton>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="mt-1 text-xs text-ink-soft underline hover:text-ink"
                >
                  Retour a la connexion
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={mode === "signup" ? handleSignUp : handleSignIn}>
                {mode === "signup" && (
                  <label className="flex items-center gap-3 rounded-sm border border-line bg-background-sunken px-4 py-3 focus-within:border-primary">
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
                <label className="flex items-center gap-3 rounded-sm border border-line bg-background-sunken px-4 py-3 focus-within:border-primary">
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
                <label className="flex items-center gap-3 rounded-sm border border-line bg-background-sunken px-4 py-3 focus-within:border-primary">
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
                {success && <p className="text-xs text-success">{success}</p>}

                <NeonButton type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={loading}>
                  {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
                </NeonButton>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="mt-1 text-xs text-ink-soft underline hover:text-ink"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
