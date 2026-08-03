"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { fetchProfile, updateProfile as updateProfileRow } from "@/services/userStats";
import type { AuthChangeEvent, Session, User, UserResponse } from "@supabase/supabase-js";
import type { Profile } from "@/types/user";

/**
 * Traduit les messages d'erreur Supabase (anglais, techniques) en messages
 * lisibles par un joueur. Tout message inconnu est renvoye tel quel plutot
 * que masque : mieux vaut un texte brut qu'une erreur silencieuse.
 */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Cet email est deja utilise. Connecte-toi plutot.";
  }
  if (m.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirme ton email avant de te connecter (verifie tes spams).";
  }
  if (m.includes("password should be at least")) {
    return "Mot de passe trop court : 6 caracteres minimum.";
  }
  if (m.includes("weak password") || m.includes("password is too weak")) {
    return "Mot de passe trop faible. Ajoute des chiffres ou des majuscules.";
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "Adresse email invalide.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Trop de tentatives. Reessaie dans quelques minutes.";
  }
  if (m.includes("user not found")) {
    return "Aucun compte associe a cet email.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Connexion au serveur impossible. Verifie ta connexion internet.";
  }
  return message;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Charge le profil DB associe a l'utilisateur courant.
  const refreshProfile = useCallback(async (userId?: string) => {
    const id = userId ?? user?.id;
    if (!id) {
      setProfile(null);
      return null;
    }
    const { data } = await fetchProfile(id);
    setProfile(data);
    return data;
  }, [user?.id]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setInitialized(true);
      return;
    }

    let active = true;

    supabase.auth.getUser().then(async (result: UserResponse) => {
      if (!active) return;
      const nextUser = result.data?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        const { data } = await fetchProfile(nextUser.id);
        if (active) setProfile(data);
      }
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        const { data } = await fetchProfile(nextUser.id);
        if (active) setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Le pseudo part dans `options.data` DES l'inscription : le trigger SQL
   * handle_new_user() lit raw_user_meta_data au moment de l'INSERT dans
   * auth.users. Le renseigner apres coup via updateUser() serait trop tard,
   * le profil serait cree avec le prefixe de l'email a la place.
   */
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return { error: "Service non disponible", needsConfirmation: false };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() || email.split("@")[0] },
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined,
        },
      });

      if (error) return { error: translateAuthError(error.message), needsConfirmation: false };

      // Session absente => Supabase attend une confirmation par email.
      const needsConfirmation = !data.session;
      return { error: null, needsConfirmation };
    } catch (err) {
      return {
        error: err instanceof Error ? translateAuthError(err.message) : "Erreur inconnue",
        needsConfirmation: false,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return { error: "Service non disponible" };

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: translateAuthError(error.message) };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? translateAuthError(err.message) : "Erreur inconnue" };
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  };

  /** Envoie le mail de reinitialisation. Renvoie toujours succes si l'appel passe. */
  const resetPassword = async (email: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return { error: "Service non disponible" };

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/profile?reset=1` : undefined,
      });
      if (error) return { error: translateAuthError(error.message) };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? translateAuthError(err.message) : "Erreur inconnue" };
    }
  };

  /** Applique un nouveau mot de passe (apres arrivee via le lien de reset). */
  const updatePassword = async (newPassword: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return { error: "Service non disponible" };

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: translateAuthError(error.message) };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? translateAuthError(err.message) : "Erreur inconnue" };
    }
  };

  /**
   * Met a jour le profil. Ecrit a la fois dans auth (metadonnees, pour que le
   * pseudo survive a une recreation de profil) et dans la table profiles
   * (source de verite pour les classements).
   */
  const updateProfile = async (data: {
    displayName?: string;
    profilePhotoUrl?: string | null;
    avatarDefault?: string;
  }) => {
    const supabase = createClient();
    if (!supabase || !user) return { error: "Non connecte" };

    const patch: Partial<Pick<Profile, "username" | "profile_photo_url" | "avatar_default">> = {};
    if (data.displayName !== undefined) patch.username = data.displayName.trim();
    if (data.profilePhotoUrl !== undefined) patch.profile_photo_url = data.profilePhotoUrl;
    if (data.avatarDefault !== undefined) patch.avatar_default = data.avatarDefault;

    if (Object.keys(patch).length === 0) return { error: null };

    const { data: updated, error } = await updateProfileRow(user.id, patch);
    if (error) return { error };

    if (data.displayName) {
      await supabase.auth.updateUser({ data: { display_name: data.displayName.trim() } });
    }

    if (updated) setProfile(updated);
    return { error: null };
  };

  return {
    user,
    profile,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };
}
