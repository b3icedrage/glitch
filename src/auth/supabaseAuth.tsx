import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: SupabaseUser;
}

interface AuthContextValue {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'glitch.supabase.session';
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function saveSession(session: SupabaseSession | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function readSession(): SupabaseSession | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as SupabaseSession : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

async function authRequest<T>(endpoint: string, body?: unknown, accessToken?: string): Promise<T> {
  if (!configured) throw new Error('Supabase is not configured yet. Add the two VITE_SUPABASE environment variables.');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || data.message || data.error_description || data.error || 'Authentication request failed.');
  }
  return data as T;
}

function withExpiry(session: SupabaseSession): SupabaseSession {
  return {
    ...session,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
  };
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((next: SupabaseSession | null) => {
    const normalized = next ? withExpiry(next) : null;
    setSession(normalized);
    saveSession(normalized);
  }, []);

  const refreshSession = useCallback(async (current: SupabaseSession) => {
    const refreshed = await authRequest<SupabaseSession>('token?grant_type=refresh_token', {
      refresh_token: current.refresh_token,
    });
    applySession(refreshed);
  }, [applySession]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      if (!configured) {
        if (active) setLoading(false);
        return;
      }
      const stored = readSession();
      if (!stored) {
        if (active) setLoading(false);
        return;
      }
      try {
        let current = stored;
        if (!current.expires_at || current.expires_at * 1000 < Date.now() + 60000) {
          const refreshed = await authRequest<SupabaseSession>('token?grant_type=refresh_token', {
            refresh_token: current.refresh_token,
          });
          current = withExpiry(refreshed);
        } else {
          const user = await authRequest<SupabaseUser>('user', undefined, current.access_token);
          current = { ...current, user };
        }
        if (active) applySession(current);
      } catch {
        if (active) applySession(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    initialize();
    return () => { active = false; };
  }, [applySession]);

  useEffect(() => {
    if (!session?.refresh_token) return;
    const timer = window.setInterval(() => {
      if ((session.expires_at || 0) * 1000 < Date.now() + 90000) {
        refreshSession(session).catch(() => applySession(null));
      }
    }, 30000);
    return () => window.clearInterval(timer);
  }, [session, refreshSession, applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await authRequest<SupabaseSession>('token?grant_type=password', { email, password });
    applySession(next);
  }, [applySession]);

  const signUp = useCallback(async (email: string, password: string) => {
    const result = await authRequest<SupabaseSession & { user?: SupabaseUser }>('signup', {
      email,
      password,
      data: { display_name: email.split('@')[0] },
    });
    if (result.access_token && result.refresh_token && result.user) {
      applySession(result);
      return true;
    }
    return false;
  }, [applySession]);

  const signOut = useCallback(async () => {
    const current = session;
    try {
      if (current?.access_token) {
        await authRequest('logout', {}, current.access_token);
      }
    } finally {
      applySession(null);
    }
  }, [session, applySession]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await authRequest(`recover?redirect_to=${encodeURIComponent(window.location.origin)}`, { email });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user || null,
    session,
    loading,
    configured,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
  }), [session, loading, signIn, signUp, signOut, sendPasswordReset]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useSupabaseAuth must be used inside SupabaseAuthProvider.');
  return value;
}
