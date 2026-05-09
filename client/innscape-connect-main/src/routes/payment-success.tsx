import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Calendar, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/lib/format";

const search = z.object({
  ref: z.string().optional(),
  method: z.string().optional(),
  amount: z.coerce.number().optional(),
});

export const Route = createFileRoute("/payment-success")({
  component: Success,
  validateSearch: search,
  head: () => ({ meta: [{ title: "Booking confirmed — InnSight" }] }),
});

function Success() {
  const { ref = "BK-00000", method = "esewa", amount = 0 } = Route.useSearch();
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center card-elevated">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold">Payment successful</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your booking is confirmed. A confirmation email is on its way.
        </p>

        <div className="mt-6 space-y-2 rounded-xl border border-border bg-secondary/50 p-4 text-left text-sm">
          <Row label="Booking reference" value={ref} mono />
          <Row label="Payment method" value={method.toUpperCase()} />
          <Row label="Amount paid" value={formatNPR(amount)} />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button asChild className="w-full">
            <Link to="/customer-dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/rooms">Browse rooms</Link>
          </Button>
        </div>
        <Button 
          variant="secondary" 
          className="w-full mt-2"
          onClick={() => window.print()}
        >
          <Download className="mr-2 h-4 w-4" /> Download Receipt
        </Button>

        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Calendar invite sent</span>
          <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Receipt emailed</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "font-medium"}>{value}</span>
    </div>
  );
}
