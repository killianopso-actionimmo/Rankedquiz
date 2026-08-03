"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, User, Pencil, Check } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { GenericAvatar } from "@/components/chaos/ChaosAvatar";
import { avatarIndex } from "@/components/profile/PhotoUpload";
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

  const [editingName, setEditingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  /** Dernier pseudo confirme, pour annuler proprement (Echap ou echec DB). */
  const savedNameRef = useRef(currentPlayerName);

  const { user, profile, signUp, signIn, signOut, updateProfile, resetPassword } = useAuth();

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
    setEditingName(false);
    setNameError("");
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

  /**
   * Pseudo courant. Une fois connecte la table profiles fait foi ; le pseudo
   * localStorage n'est qu'un repli pour les joueurs anonymes. Derive au rendu
   * plutot que recopie dans un state via useEffect : evite un rendu en cascade.
   */
  const effectiveName = profile?.username ?? currentPlayerName;
  const displayedName = editingName ? playerName : effectiveName;

  const startEditingName = () => {
    savedNameRef.current = effectiveName;
    setInputPlayerName(effectiveName);
    setNameError("");
    setEditingName(true);
    // Le focus doit attendre la levee de readOnly, sinon il est ignore.
    requestAnimationFrame(() => nameInputRef.current?.focus());
  };

  /**
   * Sauvegarde automatique du pseudo (sortie du champ, Entree, ou clic sur la
   * coche). Aucun bouton "Enregistrer" : le champ se valide tout seul.
   */
  const commitName = async () => {
    if (!editingName) return;

    const trimmed = playerName.trim();

    if (trimmed === savedNameRef.current.trim()) {
      setEditingName(false);
      return;
    }
    if (trimmed.length < 3) {
      setNameError("3 caractères minimum.");
      return;
    }

    setNameError("");
    setEditingName(false);
    setPlayerName(trimmed);
    setInputPlayerName(trimmed);

    if (user) {
      const { error: err } = await updateProfile({ displayName: trimmed });
      if (err) {
        // Echec cote base : on remet le pseudo precedent pour ne pas laisser
        // croire que le changement a ete pris en compte.
        setNameError(err);
        setInputPlayerName(savedNameRef.current);
        setPlayerName(savedNameRef.current);
        return;
      }
    }

    savedNameRef.current = trimmed;
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1600);
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
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  commitName();
                }}
              >
                {/* Photo de profil, uniquement si connecte : hors connexion il
                    n'y a ni photo ni avatar enregistre. */}
                {user && (
                  <div className="flex justify-center">
                    <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-primary">
                      {profile?.profile_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.profile_photo_url}
                          alt="Photo de profil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <GenericAvatar
                          index={avatarIndex(profile?.avatar_default ?? "avatar_1")}
                          className="h-full w-full"
                        />
                      )}
                    </div>
                  </div>
                )}

                <label
                  className={cn(
                    "flex items-center gap-3 rounded-sm border px-4 py-3 transition-colors",
                    editingName
                      ? "border-primary bg-background-sunken"
                      : "border-line bg-background-sunken",
                  )}
                >
                  <User className="h-4 w-4 shrink-0 text-ink-faint" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    placeholder="Ton pseudo"
                    autoComplete="nickname"
                    value={displayedName}
                    readOnly={!editingName}
                    maxLength={20}
                    onChange={(e) => setInputPlayerName(e.target.value)}
                    /* Sauvegarde automatique : a la sortie du champ ou sur
                       Entree. Pas de bouton dedie. */
                    onBlur={commitName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitName();
                      }
                      if (e.key === "Escape") {
                        setInputPlayerName(savedNameRef.current);
                        setEditingName(false);
                      }
                    }}
                    className={cn(
                      "w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none",
                      !editingName && "cursor-pointer",
                    )}
                    onClick={() => !editingName && startEditingName()}
                  />
                  <button
                    type="button"
                    onClick={() => (editingName ? commitName() : startEditingName())}
                    aria-label={editingName ? "Valider le pseudo" : "Modifier le pseudo"}
                    className="btn-tap flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-primary active:scale-95"
                  >
                    {nameSaved ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : editingName ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                  </button>
                </label>

                {nameError && <p className="text-xs text-danger">{nameError}</p>}
                {user && (
                  <p className="text-xs text-ink-faint">Connecté en tant que {user.email}</p>
                )}
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
