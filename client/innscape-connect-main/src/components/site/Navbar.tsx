import { Link, useRouterState } from "@tanstack/react-router";
import { Hotel, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
  { to: "/customer-dashboard", label: "My Stays" },
];

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Inn<span className="text-gold">Sight</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {auth.get() ? (
              <Button asChild variant="outline" size="sm">
                <Link to={auth.get()?.role === "manager" ? "/admin-dashboard" : auth.get()?.role === "staff" ? "/staff-dashboard" : "/customer-dashboard"}>
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link to="/rooms">Book a stay</Link>
            </Button>
          </div>

          <button
            className="md:hidden rounded-md border border-border p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {open && (
          <div className="border-t border-border/60 bg-background/95 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to as any}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {auth.get() ? (
                  <Button asChild variant="outline" size="sm">
                    <Link to={auth.get()?.role === "manager" ? "/admin-dashboard" : auth.get()?.role === "staff" ? "/staff-dashboard" : "/customer-dashboard"}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link to="/rooms">Book</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
