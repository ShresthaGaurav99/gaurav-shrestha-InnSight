export type Role = "customer" | "staff" | "admin" | "manager";

const KEY = "innsight_auth";

export type Session = {
  role: Role;
  name: string;
  email: string;
  token: string;
};

export const API_URL = "http://192.168.1.75:5000/api";

export const auth = {
  get(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },
  set(s: Session) {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  },
  clear() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
  },
  routeFor(role: Role) {
    return role === "admin" || role === "manager"
      ? "/admin-dashboard"
      : role === "staff"
        ? "/staff-dashboard"
        : "/customer-dashboard";
  },
};
