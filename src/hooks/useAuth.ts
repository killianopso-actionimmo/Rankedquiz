"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setInitialized(true);
      return;
    }

    supabase.auth.getUser().then((result: any) => {
      setUser(result.data?.user || null);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return { error: "Service non disponible" };

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) return { error: signUpError.message };

      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (updateError) return { error: updateError.message };

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Erreur inconnue" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return { error: "Service non disponible" };

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Erreur inconnue" };
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (data: { displayName?: string }) => {
    const supabase = createClient();
    if (!supabase) return;

    if (data.displayName) {
      await supabase.auth.updateUser({
        data: { display_name: data.displayName },
      });
    }
  };

  return { user, signUp, signIn, signOut, updateProfile, initialized };
}
