import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, History, UtensilsCrossed, Plus, Minus } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { bookings, rooms, menu } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNPR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "My Stays — InnSight" }] }),
});

function Dashboard() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const total = Object.entries(cart).reduce((s, [id, q]) => s + (menu.find((m) => m.id === id)?.price ?? 0) * q, 0);

  const change = (id: string, d: number) =>
    setCart((c) => {
      const n = Math.max(0, (c[id] ?? 0) + d);
      const { [id]: _, ...rest } = c;
      return n ? { ...rest, [id]: n } : rest;
    });

  const order = () => {
    if (!total) return;
    console.log("room-service order:", cart);
    toast.success("Order placed — arriving in ~25 min.");
    setCart({});
  };

  const active = bookings.filter((b) => b.status === "Active" || b.status === "Upcoming");
  const past = bookings.filter((b) => b.status === "Completed" || b.status === "Cancelled");

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold">Welcome back</p>
            <h1 className="mt-1 font-display text-4xl font-semibold">Aarav Sharma</h1>
            <p className="text-muted-foreground">Manage your stays, dining, and preferences.</p>
          </div>
          <Button asChild><Link to="/rooms">Book another stay</Link></Button>
        </div>

        <Tabs defaultValue="active" className="mt-10">
          <TabsList>
            <TabsTrigger value="active"><CalendarCheck className="mr-1.5 h-4 w-4" /> Active</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-1.5 h-4 w-4" /> History</TabsTrigger>
            <TabsTrigger value="menu"><UtensilsCrossed className="mr-1.5 h-4 w-4" /> Room service</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6 space-y-4">
            {active.map((b) => {
              const room = rooms.find((r) => r.id === b.roomId)!;
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-4 card-soft">
                  <img src={room.image} alt="" className="h-24 w-32 rounded-xl object-cover" />
                  <div className="min-w-[200px] flex-1">
                    <div className="text-xs text-muted-foreground">{b.id}</div>
                    <div className="font-display text-lg font-semibold">{room.name}</div>
                    <div className="text-sm text-muted-foreground">{b.checkIn} → {b.checkOut}</div>
                  </div>
                  <div className="text-right">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium",
                      b.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {b.status}
                    </span>
                    <div className="mt-1 font-semibold">{formatNPR(b.total)}</div>
                  </div>
                </div>
              );
            })}
            {!active.length && <Empty>No active bookings.</Empty>}
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-4">
            {past.map((b) => {
              const room = rooms.find((r) => r.id === b.roomId)!;
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-4 card-soft">
                  <img src={room.image} alt="" className="h-20 w-28 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{b.id}</div>
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">{b.checkIn} → {b.checkOut}</div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{b.status}</span>
                    <div className="mt-1 text-sm font-semibold">{formatNPR(b.total)}</div>
                  </div>
                </div>
              );
            })}
            {!past.length && <Empty>No past bookings yet.</Empty>}
          </TabsContent>

          <TabsContent value="menu" className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {menu.map((m) => (
                <div key={m.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 card-soft">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{m.category}</div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.description}</div>
                  </div>
                  <div className="font-semibold">{formatNPR(m.price)}</div>
                  <div className="flex items-center gap-1 rounded-lg border border-border">
                    <Button type="button" size="icon" variant="ghost" onClick={() => change(m.id, -1)}><Minus className="h-4 w-4" /></Button>
                    <span className="w-6 text-center text-sm">{cart[m.id] ?? 0}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => change(m.id, 1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-card p-5 card-elevated lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-semibold">Your order</h3>
              <div className="mt-3 space-y-1 text-sm">
                {Object.entries(cart).map(([id, q]) => {
                  const item = menu.find((m) => m.id === id)!;
                  return (
                    <div key={id} className="flex justify-between">
                      <span className="text-muted-foreground">{item.name} × {q}</span>
                      <span>{formatNPR(item.price * q)}</span>
                    </div>
                  );
                })}
                {!Object.keys(cart).length && <div className="text-muted-foreground">Cart is empty.</div>}
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-3 font-semibold">
                <span>Total</span><span>{formatNPR(total)}</span>
              </div>
              <Button onClick={order} disabled={!total} className="mt-4 w-full bg-gold text-gold-foreground hover:bg-gold/90">
                Send to room
              </Button>
            </aside>
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">{children}</div>;
}
