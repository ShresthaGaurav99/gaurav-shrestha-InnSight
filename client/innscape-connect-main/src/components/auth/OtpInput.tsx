import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  length = 4,
  onComplete,
  className,
}: {
  length?: number;
  onComplete?: (code: string) => void;
  className?: string;
}) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const set = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...vals];
    next[i] = digit;
    setVals(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every((c) => c) && onComplete) onComplete(next.join(""));
  };

  return (
    <div className={cn("flex justify-center gap-3", className)}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !vals[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-14 w-12 rounded-xl border border-input bg-background text-center text-2xl font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ))}
    </div>
  );
}

export function useResendTimer(seconds = 30) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return { left, reset: () => setLeft(seconds) };
}
