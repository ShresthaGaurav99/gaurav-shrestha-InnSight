import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [{ title: "Create account — InnSight" }] }),
});

function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your refined stay experience."
      footer={<>Already a member? <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isLoading) return;
          setIsLoading(true);
          
          const data = Object.fromEntries(new FormData(e.currentTarget));
          
          try {
            const res = await fetch(`${API_URL}/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                password: data.password,
                role: "customer",
              }),
            });
            
            const json = await res.json();
            
            if (!res.ok) {
              throw new Error(json.message || "Registration failed");
            }
            
            toast.success("Verification code sent.");
            navigate({ to: "/otp", search: { email: String(data.email) } });
          } catch (err: any) {
            toast.error(err.message);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" required className="mt-1.5 h-11" />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" required className="mt-1.5 h-11" />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5 h-11" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required className="mt-1.5 h-11" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="mt-1.5 h-11" />
        </div>
        <Button type="submit" className="h-11 w-full mt-2" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
