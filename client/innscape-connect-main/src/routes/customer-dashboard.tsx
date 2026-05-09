import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarCheck, UtensilsCrossed, User, Plus, Minus, QrCode } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { menu } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNPR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { auth, API_URL } from "@/lib/auth";

export const Route = createFileRoute("/customer-dashboard")({
  component: CustomerDashboard,
  head: () => ({ meta: [{ title: "My Stays — InnSight" }] }),
});

const NAV = [
  { id: "bookings", label: "My Bookings", icon: CalendarCheck },
  { id: "service", label: "Order Room Service", icon: UtensilsCrossed },
  { id: "profile", label: "Profile Settings", icon: User },
];

function CustomerDashboard() {
  const [tab, setTab] = useState("bookings");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [dbMenu, setDbMenu] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const navigate = useNavigate();
  const session = auth.get();

  // Auth guard
  useEffect(() => {
    if (!session) {
      navigate({ to: "/auth", replace: true });
    }
  }, [session, navigate]);

  // Fetch real bookings
  useEffect(() => {
    if (!session) return;
    fetch(`${API_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((r) => r.json())
      .then(setMyBookings)
      .catch(console.error);
  }, [session]);

  const fetchMyOrders = () => {
    if (!session) return;
    fetch(`${API_URL}/room-service/my`, { headers: { Authorization: `Bearer ${session.token}` } })
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMyOrders(data))
      .catch(console.error);
  };

  useEffect(() => {
    let interval: any;
    if (tab === "service" && session) {
      if (dbMenu.length === 0) {
        fetch(`${API_URL}/menu`, { headers: { Authorization: `Bearer ${session.token}` } })
          .then(r => r.json())
          .then(data => {
            if (data && Array.isArray(data.items)) setDbMenu(data.items);
          })
          .catch(console.error);
      }
      fetchMyOrders();
      interval = setInterval(fetchMyOrders, 5000); // Poll every 5s for live updates
    }
    return () => clearInterval(interval);
  }, [tab, session, dbMenu.length]);

  if (!session) return null;

  const total = Object.entries(cart).reduce(
    (s, [id, q]) => s + (dbMenu.find((m) => m.id === id)?.price ?? 0) * q,
    0
  );

  const change = (id: string, d: number) =>
    setCart((c) => {
      const n = Math.max(0, (c[id] ?? 0) + d);
      const { [id]: _omit, ...rest } = c;
      return n ? { ...rest, [id]: n } : rest;
    });

  const active = myBookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED" || b.status === "CHECKED_IN"
  );

  const order = async () => {
    if (!total) return;
    if (active.length === 0) {
      toast.error("You must have an active booking to order room service.");
      return;
    }
    
    setIsOrdering(true);
    const primaryBooking = active[0];
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    };

    try {
      const orderPromises = Object.entries(cart).map(([menuItemId, quantity]) => {
        return fetch(`${API_URL}/room-service`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            roomNumber: primaryBooking.room_number || "N/A",
            bookingId: primaryBooking.id,
            menuItemId,
            quantity,
            guestName: session.name
          })
        });
      });

      await Promise.all(orderPromises);
      toast.success("Order sent to staff. ETA ~25 min.");
      setCart({});
      fetchMyOrders();
    } catch (e) {
      toast.error("Failed to place order.");
    } finally {
      setIsOrdering(false);
    }
  };
  const past = myBookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <DashboardShell
      roleLabel="Guest portal"
      user={{ name: session.name, email: session.email }}
      nav={NAV}
      active={tab}
      onNavigate={setTab}
    >
      {tab === "bookings" && (
        <div className="space-y-6">
          <h2 className="font-display text-lg font-semibold">Active stays</h2>
          {active.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-card card-elevated">
              <div className="grid gap-0 sm:grid-cols-[200px_1fr_auto]">
                <img
                  src={b.room_images?.[0] || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"}
                  alt=""
                  className="h-40 w-full object-cover sm:h-full"
                />
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">#{b.id}</div>
                  <div className="font-display text-xl font-semibold">{b.room_title || b.room_type || `Room ${b.room_number}`}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(b.checkIn || b.check_in).toLocaleDateString()} → {new Date(b.checkOut || b.check_out).toLocaleDateString()}
                  </div>
                  <span className={cn("mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                    b.status === "CHECKED_IN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {b.status}
                  </span>
                  <div className="mt-2 font-semibold">{formatNPR(b.totalAmount || b.total_price || 0)}</div>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 border-t border-border p-5 sm:border-l sm:border-t-0">
                  <div className="grid h-24 w-24 place-items-center rounded-lg border-2 border-border bg-secondary/40">
                    <QrCode className="h-14 w-14 text-foreground" />
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">#{b.id}</div>
                </div>
              </div>
            </div>
          ))}
          {!active.length && <Empty>No active bookings.</Empty>}

          <h2 className="pt-2 font-display text-lg font-semibold">Past stays</h2>
          {past.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 card-soft">
              <img
                src={b.room_images?.[0] || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"}
                alt=""
                className="h-16 w-24 rounded-lg object-cover"
              />
              <div className="min-w-[160px] flex-1">
                <div className="text-xs text-muted-foreground">#{b.id}</div>
                <div className="font-medium">{b.room_title || b.room_type || `Room ${b.room_number}`}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(b.checkIn || b.check_in).toLocaleDateString()} → {new Date(b.checkOut || b.check_out).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right text-sm font-semibold">{formatNPR(b.totalAmount || b.total_price || 0)}</div>
            </div>
          ))}
          {!past.length && <Empty>No past stays yet.</Empty>}

          <div>
            <Button asChild><Link to="/rooms">Book another stay</Link></Button>
          </div>
        </div>
      )}

      {tab === "service" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {dbMenu.length === 0 ? (
               <div className="text-center text-sm text-muted-foreground p-10">Loading menu...</div>
            ) : dbMenu.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 card-soft">
                <div className="min-w-[160px] flex-1">
                  <div className="text-xs text-muted-foreground uppercase">{m.category_name || "Food"}</div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.description}</div>
                </div>
                <div className="font-semibold">{formatNPR(m.price)}</div>
                <div className="flex items-center gap-1 rounded-lg border border-border">
                  <Button type="button" size="icon" variant="ghost" onClick={() => change(m.id, -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center text-sm">{cart[m.id] ?? 0}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => change(m.id, 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-border bg-card p-5 card-elevated lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-semibold">Your order</h3>
            <div className="mt-3 space-y-1 text-sm">
              {Object.entries(cart).map(([id, q]) => {
                const item = dbMenu.find((m) => m.id === id);
                if (!item) return null;
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
            <Button onClick={order} disabled={!total || isOrdering} className="mt-4 w-full bg-gold text-gold-foreground hover:bg-gold/90">
              {isOrdering ? "Sending Order..." : "Order to Room"}
            </Button>

            {myOrders.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-display text-base font-semibold mb-3">Recent Orders</h3>
                <div className="space-y-3">
                  {myOrders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex justify-between items-center bg-secondary/20 p-2 rounded-lg text-sm">
                      <div>
                        <div className="font-medium text-xs">{o.quantity}x {o.menu_item_name || o.item}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        o.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                        o.status === "IN-PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      )}>{o.status === "COMPLETED" ? "Delivered" : o.status === "IN-PROGRESS" ? "In Progress" : "Pending"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {tab === "profile" && (
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 card-soft">
          <h3 className="font-display text-lg font-semibold">Profile settings</h3>
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated."); }}
          >
            <div><Label>Full name</Label><Input defaultValue={session.name} className="mt-1.5" /></div>
            <div><Label>Email</Label><Input defaultValue={session.email} className="mt-1.5" /></div>
            <div><Label>Phone</Label><Input defaultValue="+977 98XXXXXXXX" className="mt-1.5" /></div>
            <div><Label>Country</Label><Input defaultValue="Nepal" className="mt-1.5" /></div>
            <div className="sm:col-span-2 flex justify-end"><Button type="submit">Save changes</Button></div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">{children}</div>;
}
