import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSupabaseClient } from '../supabase/client';

type SupabaseUser = { id: string } | null;

const SupabaseAuthContext = createContext<{
  user: SupabaseUser;
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({ user: null, loading: true, signUpWithEmail: async () => {}, signInWithEmail: async () => {}, signOut: async () => {} });

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient() as any;
  const [user, setUser] = useState<SupabaseUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!supabase || typeof supabase.auth === 'undefined') {
          if (mounted) setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getSession?.();
        if (mounted) setUser(data?.session?.user ?? null);

        const { subscription } = supabase.auth.onAuthStateChange((event: string, session: any) => {
          if (!mounted) return;
          setUser(session?.user ?? null);
        }) || {};

        return () => {
          mounted = false;
          if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
        };
      } catch (e) {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not configured');
    const r = await supabase.auth.signUp({ email, password });
    if (r.error) throw r.error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not configured');
    const r = await supabase.auth.signInWithPassword({ email, password });
    if (r.error) throw r.error;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <SupabaseAuthContext.Provider value={{ user, loading, signUpWithEmail, signInWithEmail, signOut }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export default SupabaseAuthContext;
