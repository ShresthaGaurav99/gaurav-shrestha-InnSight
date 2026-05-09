import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput, useResendTimer } from "@/components/auth/OtpInput";
import { cn } from "@/lib/utils";
import { formatNPR } from "@/lib/format";

type Provider = "khalti" | "esewa";

const THEMES: Record<Provider, { name: string; from: string; to: string; ring: string; idLabel: string; pwLabel: string; tagline: string }> = {
  khalti: {
    name: "Khalti",
    from: "from-[#5C2D91]",
    to: "to-[#7A3FBE]",
    ring: "ring-[#5C2D91]/40",
    idLabel: "Khalti Mobile Number",
    pwLabel: "Khalti MPIN",
    tagline: "Pay seamlessly with Khalti.",
  },
  esewa: {
    name: "eSewa",
    from: "from-[#0F8C3B]",
    to: "to-[#5BB85B]",
    ring: "ring-[#0F8C3B]/40",
    idLabel: "eSewa ID (Mobile / Email)",
    pwLabel: "eSewa Password",
    tagline: "Login to eSewa to pay securely.",
  },
};

export function PaymentModal({
  open,
  provider,
  amount,
  onClose,
  onSuccess,
}: {
  open: boolean;
  provider: Provider;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"creds" | "otp" | "processing">("creds");
  const [loading, setLoading] = useState(false);
  const { left, reset } = useResendTimer(30);

  useEffect(() => {
    if (open) {
      setStep("creds");
      setLoading(false);
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const theme = THEMES[provider];

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      reset();
    }, 800);
  };

  const completeOtp = () => {
    setStep("processing");
    setTimeout(() => onSuccess(), 1100);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl ring-1", theme.ring)}>
        <div className={cn("relative bg-gradient-to-br p-5 text-white", theme.from, theme.to)}>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/15 p-1.5 hover:bg-white/25"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 font-bold">
              {theme.name[0]}
            </span>
            <div>
              <div className="font-display text-lg font-semibold">{theme.name}</div>
              <div className="text-xs opacity-90">{theme.tagline}</div>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">Amount due</div>
              <div className="font-display text-2xl font-bold">{formatNPR(amount)}</div>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-90">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === "creds" && (
            <form className="space-y-4" onSubmit={submitCreds}>
              <Field label={theme.idLabel} icon={<Smartphone className="h-4 w-4 text-muted-foreground" />} name="id" />
              <Field label={theme.pwLabel} name="pw" type="password" />
              <Button
                type="submit"
                disabled={loading}
                className={cn("h-11 w-full bg-gradient-to-r text-white hover:opacity-95", theme.from, theme.to)}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {provider === "khalti" ? "Pay with Khalti" : "Login & Pay"}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                You will be charged {formatNPR(amount)} on confirmation.
              </p>
            </form>
          )}

          {step === "otp" && (
            <div>
              <div className="text-sm text-muted-foreground">
                Enter the 6-digit verification code sent to your registered mobile.
              </div>
              <OtpInput length={6} className="my-5" onComplete={completeOtp} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {left > 0 ? `Resend in 0:${String(left).padStart(2, "0")}` : "Didn't receive it?"}
                </span>
                <button
                  disabled={left > 0}
                  onClick={() => reset()}
                  className={cn("font-medium", left > 0 ? "text-muted-foreground" : "text-foreground hover:underline")}
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              <div className="font-medium">Processing your payment…</div>
              <div className="text-xs text-muted-foreground">Do not close this window.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, name, type = "text", icon,
}: { label: string; name: string; type?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor={name}>{label}</label>
      <div className="relative">
        {icon && <span className="absolute inset-y-0 left-3 flex items-center">{icon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          required
          className={cn(
            "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            icon && "pl-9",
          )}
        />
      </div>
    </div>
  );
}
