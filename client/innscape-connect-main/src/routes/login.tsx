import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { auth, API_URL } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — InnSight" }] }),
});

function Login() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your stays."
      footer={<>New to InnSight? <Link to="/register" className="font-medium text-foreground hover:underline">Create an account</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const res = await fetch(`${API_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: String(data.email),
                password: String(data.password),
              }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.message || "Login failed");
            auth.set({
              role: payload.user.role,
              name: payload.user.name,
              email: payload.user.email,
              token: payload.token,
            });
            toast.success("Welcome back.");
            navigate({ to: auth.routeFor(payload.user.role) });
          } catch (err: any) {
            toast.error(err.message || "Login failed");
          }
        }}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5 h-11" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="mt-1.5 h-11" />
        </div>
        <Button type="submit" className="h-11 w-full">Continue</Button>
      </form>
    </AuthShell>
  );
}
