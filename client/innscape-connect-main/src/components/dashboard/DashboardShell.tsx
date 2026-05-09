import type { ReactNode, ComponentType } from "react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Hotel, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { toast } from "sonner";

export type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export function DashboardShell({
  roleLabel,
  user,
  nav,
  active,
  onNavigate,
  children,
}: {
  roleLabel: string;
  user: { name: string; email: string };
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    auth.clear();
    toast.success("Signed out.");
    navigate({ to: "/" });
  };

  const Sidebar = (
    <aside className="flex h-full flex-col border-r border-border bg-sidebar">
      <Link to="/" className="flex items-center gap-2 px-6 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Hotel className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-semibold">
          Inn<span className="text-gold">Sight</span>
        </span>
      </Link>
      <div className="px-6 pb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {roleLabel}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const isActive = n.id === active;
          return (
            <button
              key={n.id}
              onClick={() => {
                onNavigate(n.id);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          );
        })}
      </nav>
      <div className="space-y-3 p-4">
        <div className="rounded-xl bg-primary p-4 text-primary-foreground">
          <div className="text-xs opacity-80">{roleLabel}</div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs opacity-70 truncate">{user.email}</div>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="grid min-h-screen bg-secondary/30 lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar">{Sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-border p-2 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {roleLabel}
              </div>
              <h1 className="font-display text-lg font-semibold sm:text-xl">
                {nav.find((n) => n.id === active)?.label}
              </h1>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">View site</Link>
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
