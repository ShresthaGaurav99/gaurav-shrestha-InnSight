import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const search = z.object({ email: z.string().optional() });
const LEN = 6;

export const Route = createFileRoute("/otp")({
  component: Otp,
  validateSearch: search,
  head: () => ({ meta: [{ title: "Verify — InnSight" }] }),
});

function Otp() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [vals, setVals] = useState<string[]>(Array(LEN).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    const next = [...vals];
    next[i] = c;
    setVals(next);
    if (c && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = vals.join("");
    if (code.length !== LEN) return toast.error("Enter all 6 digits.");
    console.log("otp verify:", { email, code });
    toast.success("Verified! Welcome to InnSight.");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a 6-digit code${email ? ` to ${email}` : ""}.`}
    >
      <form onSubmit={submit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {vals.map((v, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={v}
              onChange={(e) => handle(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-xl border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          ))}
        </div>
        <Button type="submit" className="h-11 w-full">Verify & continue</Button>
        <div className="text-center text-sm text-muted-foreground">
          Didn't receive it?{" "}
          <button type="button" onClick={() => toast.success("Code resent.")} className="font-medium text-foreground hover:underline">
            Resend code
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
