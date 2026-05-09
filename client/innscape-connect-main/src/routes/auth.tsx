import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Hotel, ShieldCheck, Briefcase, User, Loader2 } from "lucide-react";
import hero from "@/assets/hero-hotel.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { OtpInput, useResendTimer } from "@/components/auth/OtpInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { auth, API_URL, type Role } from "@/lib/auth";

const search = z.object({ tab: z.enum(["customer", "staff", "admin"]).optional() });

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign in — InnSight" }] }),
});

const TABS: { id: Role; label: string; icon: typeof User; desc: string }[] = [
  { id: "customer", label: "Customer", icon: User, desc: "Book and manage your stays." },
  { id: "staff", label: "Staff", icon: Briefcase, desc: "Operations & service portal." },
  { id: "admin", label: "Admin", icon: ShieldCheck, desc: "Full property management." },
];

function AuthPage() {
  const { tab: initial } = Route.useSearch();
  const [tab, setTab] = useState<Role>(initial ?? "customer");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-primary">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">InnSight</span>
          </Link>
          <p className="mt-6 max-w-sm font-display text-3xl font-medium leading-tight">
            "An effortless stay, from the first tap to the last goodbye."
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">InnSight</span>
          </Link>

          <h1 className="font-display text-3xl font-semibold">Sign in to InnSight</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {TABS.find((t) => t.id === tab)?.desc}
          </p>

          {/* Role tabs */}
          <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl border border-border bg-secondary/50 p-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 transition-all duration-300">
            {tab === "customer" && <CustomerAuth />}
            {tab === "staff" && <StaffLogin />}
            {tab === "admin" && <AdminLogin />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Customer ---------- */

function CustomerAuth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [otpOpen, setOtpOpen] = useState(false);
  const [pending, setPending] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();
  const { left, reset } = useResendTimer(30);

  const handleSuccess = async () => {
    if (!pending) return;
    try {
      // Find the input field for OTP dynamically if we need it, but OtpInput gives onComplete the string.
      // Wait, OtpInput calls onComplete with no args or with the otp string? 
      // The old code: onComplete={handleSuccess}. So handleSuccess gets the OTP string as argument.
    } catch(e) {}
  };

  const handleVerify = async (otpValue: string) => {
    if (!pending) return;
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pending.email, otp: otpValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');
      
      auth.set({ role: "customer", name: data.user.name, email: data.user.email, token: data.token });
      setOtpOpen(false);
      toast.success("Welcome to InnSight.");
      navigate({ to: "/customer-dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      {mode === "login" ? (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = Object.fromEntries(new FormData(e.currentTarget));
            
            try {
              const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: String(fd.email), password: fd.password })
              });
              const data = await res.json();
              
              if (!res.ok) {
                throw new Error(data.message || "Login failed");
              } else {
                auth.set({ role: data.user.role, name: data.user.name, email: data.user.email, token: data.token });
                toast.success("Welcome to InnSight.");
                navigate({ to: `/${data.user.role}-dashboard` });
              }
            } catch (err: any) {
              toast.error(err.message);
            }
          }}
        >
          <Field label="Email" name="email" type="email" />
          <Field label="Password" name="password" type="password" />
          <Button type="submit" className="mt-2 h-11 w-full text-base font-semibold">Sign In</Button>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = Object.fromEntries(new FormData(e.currentTarget));
            const email = String(fd.email);
            try {
              const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fd.name, email, password: fd.password, role: 'customer' })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Registration failed");
              
              setPending({ name: String(fd.name), email });
              setOtpOpen(true);
              reset();
              toast.success(data.message || "Verify your email to finish sign-up.");
            } catch (err: any) {
              toast.error(err.message);
            }
          }}
        >
          <Field label="Full name" name="name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" />
          <Field label="Password" name="password" type="password" />
          <Button type="submit" className="mt-2 h-11 w-full bg-primary text-base font-semibold text-primary-foreground">Create Account</Button>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </form>
      )}

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Verify your account</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to <b>{pending?.email}</b>.
            </DialogDescription>
          </DialogHeader>
          <OtpInput length={6} onComplete={handleVerify} className="my-4" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {left > 0 ? `Resend in 0:${String(left).padStart(2, "0")}` : "Didn't receive the code?"}
            </span>
            <button
              disabled={left > 0}
              onClick={() => {
                reset();
                toast.success("New code sent.");
              }}
              className={cn(
                "font-medium transition-colors",
                left > 0 ? "text-muted-foreground" : "text-foreground hover:underline",
              )}
            >
              Resend OTP
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- Staff ---------- */

function StaffLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.currentTarget));
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: fd.staffId, password: fd.password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Login failed");
          
          if (data.user.role !== 'staff' && data.user.role !== 'manager') {
            throw new Error("Unauthorized role for this portal");
          }
          
          auth.set({ role: data.user.role, name: data.user.name, email: data.user.email, token: data.token });
          toast.success("Signed in as Staff.");
          navigate({ to: "/staff-dashboard" });
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <Field label="Staff ID or Email" name="staffId" placeholder="STF-2031 / sita@innsight.com" />
      <Field label="Password" name="password" type="password" />
      <p className="text-xs text-muted-foreground">
        Staff accounts are issued by Admin. Contact your manager for access.
      </p>
      <Button type="submit" disabled={loading} className="h-11 w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

/* ---------- Admin ---------- */

function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.currentTarget));
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: fd.email, password: fd.password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Login failed");
          
          if (data.user.role !== 'admin' && data.user.role !== 'manager') {
            throw new Error("Admin privileges required");
          }
          
          auth.set({ role: data.user.role, name: data.user.name, email: data.user.email, token: data.token });
          toast.success("Welcome back, Admin.");
          navigate({ to: "/admin-dashboard" });
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-foreground">
        <ShieldCheck className="h-4 w-4 text-gold-foreground" />
        Secured admin access — actions are audited.
      </div>
      <Field label="Admin email" name="email" type="email" />
      <Field label="Password" name="password" type="password" />
      <Button type="submit" disabled={loading} className="h-11 w-full bg-primary">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign in securely
      </Button>
    </form>
  );
}

function Field({
  label, name, type = "text", placeholder,
}: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required className="mt-1.5 h-11" />
    </div>
  );
}
