import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-failed")({
  component: Failed,
  head: () => ({ meta: [{ title: "Payment failed — InnSight" }] }),
});

function Failed() {
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-background p-8 text-center card-elevated">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold">Payment failed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn't process your payment. Please try again or use a different method.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button asChild className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Link to="/checkout">Try again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
