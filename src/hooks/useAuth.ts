import { useCallback, useEffect, useState } from "react";
import { api, setAuthToken } from "lib/api";

/* ── Types ──────────────────────────────────────────────────────── */
export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  provider?: "email" | "google" | "github";
  restaurantId?: number | null;
  restaurantName?: string | null;
};

export type Address = {
  id: string;
  label: string; // "Home", "Work", etc.
  line: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  type: "upi" | "card";
  label: string; // "user@okaxis" or "•••• 4242"
  detail: string; // same value displayed
  isDefault: boolean;
};

export type DietaryPref = "none" | "veg" | "vegan" | "halal";

export type UserProfile = {
  phone: string;
  addresses: Address[];
  dietary: DietaryPref;
  paymentMethods: PaymentMethod[];
  notifications: { email: boolean; push: boolean };
};

type AuthResponse = { token: string; user: AuthUser };

const USER_KEY    = "saas_user";
const TOKEN_KEY   = "saas_token";
const PROFILE_KEY = "saas_profile";

/* ── Token helpers ───────────────────────────────────────────────── */
const getTokenExpiryMs = (jwt: string | null) => {
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload?.exp ? payload.exp * 1000 : null;
  } catch { return null; }
};

/* ── Mock OAuth profiles ─────────────────────────────────────────── */
const MOCK_OAUTH: Record<"google" | "github", { user: AuthUser; profile: UserProfile }> = {
  google: {
    user: {
      id: 9001, name: "Alex Johnson", email: "alex.johnson@gmail.com",
      role: "user", provider: "google",
      avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=ea4335&color=fff&size=128",
    },
    profile: {
      phone: "+91 98765 43210",
      addresses: [
        { id: "a1", label: "Home", line: "42 MG Road", city: "Bangalore", pincode: "560001", isDefault: true },
      ],
      dietary: "none",
      paymentMethods: [
        { id: "p1", type: "upi", label: "alex@okaxis", detail: "alex@okaxis", isDefault: true },
      ],
      notifications: { email: true, push: true },
    },
  },
  github: {
    user: {
      id: 9002, name: "Dev Kapoor", email: "devkapoor@github.com",
      role: "user", provider: "github",
      avatar: "https://ui-avatars.com/api/?name=Dev+Kapoor&background=24292e&color=fff&size=128",
    },
    profile: {
      phone: "+91 91234 56789",
      addresses: [
        { id: "a2", label: "Work", line: "12 Cyber Hub", city: "Gurugram", pincode: "122002", isDefault: true },
      ],
      dietary: "veg",
      paymentMethods: [
        { id: "p2", type: "card", label: "•••• 4242", detail: "Visa •••• 4242", isDefault: true },
      ],
      notifications: { email: true, push: false },
    },
  },
};

const defaultProfile = (): UserProfile => ({
  phone: "",
  addresses: [],
  dietary: "none",
  paymentMethods: [],
  notifications: { email: true, push: true },
});

/* ── Hook ────────────────────────────────────────────────────────── */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [profile, setProfile] = useState<UserProfile>(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : defaultProfile();
  });

  useEffect(() => { setAuthToken(token); }, [token]);

  /* Auto-expire token */
  useEffect(() => {
    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;
    const remaining = expiryMs - Date.now();
    if (remaining <= 0) { _clear(); return; }
    const t = window.setTimeout(_clear, remaining);
    return () => window.clearTimeout(t);
  }, [token]);

  const _persistUser = (u: AuthUser, t: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
    setAuthToken(t);
    setUser(u);
    setToken(t);
  };

  const _persistProfile = (p: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  };

  const _clear = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setAuthToken(null);
    setUser(null);
    setToken(null);
    setProfile(defaultProfile());
  };

  /* ── Email login / signup ── */
  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    _persistUser(data.user, data.token);
  };

  const signup = async (name: string, email: string, password: string, role?: string, adminCode?: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password, role, adminCode });
    _persistUser(data.user, data.token);
  };

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      // Sync with backend using the Google JWT
      const { data } = await api.post<AuthResponse>("/auth/google-sync", { 
        credential 
      });
      
      _persistUser(data.user, data.token);
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }, []);

  /* ── Profile updates ── */
  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = _clear;

  return {
    user, token, profile,
    login, signup, loginWithGoogle,
    updateProfile, updateUser,
    logout,
    isAuthenticated: !!token,
  };
};
