import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ClipboardList, UtensilsCrossed, Clock, LogIn, LogOut as LogOutIcon, CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { staffOrders, todayCheckins, todayCheckouts, type StaffOrder } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/staff-dashboard")({
  component: StaffDashboard,
  head: () => ({ meta: [{ title: "Staff — InnSight" }] }),
});

const NAV = [
  { id: "tasks", label: "Today's Tasks", icon: ClipboardList },
  { id: "orders", label: "Room Service Orders", icon: UtensilsCrossed },
  { id: "payments", label: "Payments", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: Clock },
];

function StaffDashboard() {
  const [tab, setTab] = useState("tasks");
  const [clockedIn, setClockedIn] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const navigate = useNavigate();
  const session = auth.get();

  const fetchOrders = () => {
    if (!session) return;
    fetch(`${API_URL}/room-service`, { headers: { "Authorization": `Bearer ${session.token}` } })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setDbOrders(data))
      .catch(console.error);
  };

  useEffect(() => {
    let interval: any;
    if (tab === "orders") {
      fetchOrders();
      interval = setInterval(fetchOrders, 5000); // Poll every 5s for live updates
    }
    return () => clearInterval(interval);
  }, [tab]);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    const headers = { "Authorization": `Bearer ${session.token}` };
    fetch(`${API_URL}/attendance/history/${session.email}`, { headers })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          const todayStr = new Date().toISOString().split('T')[0];
          const todayEntry = data.find(d => d.date.startsWith(todayStr));
          if (todayEntry && todayEntry.check_in && !todayEntry.check_out) {
            setClockedIn(true);
          } else {
            setClockedIn(false);
          }
        }
      })
      .catch(console.error);
  }, [session, navigate]);

  const toggleClock = async () => {
    if (!session) return;
    const action = clockedIn ? "check-out" : "check-in";
    try {
      const res = await fetch(`${API_URL}/attendance/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify({ email: session.email, name: session.name })
      });
      if (res.ok) {
        setClockedIn(!clockedIn);
        toast.success(clockedIn ? "Clocked out successfully." : "Clocked in successfully.");
        const histRes = await fetch(`${API_URL}/attendance/history/${session.email}`, { 
          headers: { "Authorization": `Bearer ${session.token}` } 
        });
        const data = await histRes.json();
        if (Array.isArray(data)) setHistory(data);
      } else {
        toast.error("Failed to update attendance.");
      }
    } catch (e) {
      toast.error("Error updating attendance.");
    }
  };

  if (!session) return null;

  const advance = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PENDING" ? "IN-PROGRESS" : "COMPLETED";
    try {
      const res = await fetch(`${API_URL}/room-service/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchOrders();
    } catch (e) {}
  };

  return (
    <DashboardShell
      roleLabel="Staff portal"
      user={{ name: session.name, email: session.email }}
      nav={NAV}
      active={tab}
      onNavigate={setTab}
    >
      {/* Always-visible clock card */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 card-elevated">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Your shift</div>
          <div className="font-display text-2xl font-semibold">
            {clockedIn ? "On the clock" : "Off duty"}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Front desk · Today
          </div>
        </div>
        <Button
          onClick={toggleClock}
          className={cn(
            "h-12 min-w-[160px] text-base",
            clockedIn
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-gold text-gold-foreground hover:bg-gold/90",
          )}
        >
          {clockedIn ? <><LogOutIcon className="mr-2 h-4 w-4" /> Clock out</> : <><LogIn className="mr-2 h-4 w-4" /> Clock in</>}
        </Button>
      </div>

      {tab === "tasks" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Column title="Expected check-ins">
            {todayCheckins.map((g) => (
              <Item key={g.name} primary={g.name} secondary={`${g.room} · ${g.time}`} actionLabel="Mark arrived" onAction={() => toast.success(`${g.name} checked in.`)} />
            ))}
          </Column>
          <Column title="Expected check-outs">
            {todayCheckouts.map((g) => (
              <Item key={g.name} primary={g.name} secondary={`${g.room} · ${g.time}`} actionLabel="Mark departed" onAction={() => toast.success(`${g.name} checked out.`)} />
            ))}
          </Column>
        </div>
      )}

      {tab === "orders" && (
        <div className="grid gap-4 md:grid-cols-3">
          {(["PENDING", "IN-PROGRESS", "COMPLETED"] as const).map((col) => (
            <Column key={col} title={col === "COMPLETED" ? "Delivered" : (col === "IN-PROGRESS" ? "In progress" : "Pending")} count={dbOrders.filter((o) => o.status === col).length}>
              {dbOrders.filter((o) => o.status === col).map((o) => (
                <div key={o.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{o.id.substring(0, 8).toUpperCase()}</span>
                    <span>{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="mt-1 font-medium">Room {o.room_number || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{o.booking_guest_name || o.guest_name || "Guest"}</div>
                  <div className="mt-2 text-sm">{o.quantity}x {o.item} {o.special_request ? `(${o.special_request})` : ""}</div>
                  {o.status !== "COMPLETED" && (
                    <Button size="sm" className="mt-3 w-full" onClick={() => advance(o.id, o.status)}>
                      {o.status === "PENDING" ? "Start preparing" : "Mark delivered"}
                    </Button>
                  )}
                  {o.status === "COMPLETED" && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                    </div>
                  )}
                </div>
              ))}
            </Column>
          ))}
        </div>
      )}

      {tab === "attendance" && (
        <div className="rounded-2xl border border-border bg-card p-5 card-soft">
          <h3 className="font-display text-lg font-semibold">My attendance history</h3>
          <div className="mt-4 space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records found.</p>
            ) : (
              history.map((record: any) => {
                const ci = new Date(record.check_in);
                const co = record.check_out ? new Date(record.check_out) : null;
                const hours = co ? ((co.getTime() - ci.getTime()) / (1000 * 60 * 60)).toFixed(1) : "—";
                return (
                  <div key={record.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                    <div className="font-medium">{new Date(record.date).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      {ci.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {co ? co.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                    </div>
                    <div className="font-semibold">{hours} hrs</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {tab === "payments" && <PaymentsTable />}
    </DashboardShell>
  );
}

function Column({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 card-soft">
      <div className="flex items-center justify-between px-1 pb-3">
        <h4 className="font-display text-base font-semibold">{title}</h4>
        {count !== undefined && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{count}</span>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({
  primary, secondary, actionLabel, onAction,
}: { primary: string; secondary: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
      <div>
        <div className="font-medium">{primary}</div>
        <div className="text-xs text-muted-foreground">{secondary}</div>
      </div>
      <Button size="sm" variant="ghost" onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

function useAuthHeaders(): Record<string, string> {
  const session = auth.get();
  return session ? { "Authorization": `Bearer ${session.token}` } : {};
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNPR } from "@/lib/format";
import { API_URL } from "@/lib/auth";

function PaymentsTable() {
  const [dbPayments, setDbPayments] = useState<any[]>([]);
  const headers = useAuthHeaders();

  useEffect(() => {
    fetch(`${API_URL}/billing`, { headers })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setDbPayments(data) : setDbPayments([]))
      .catch(console.error);
  }, [headers]);

  return (
    <div className="rounded-2xl border border-border bg-card card-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h3 className="font-display text-lg font-semibold">Guest Payments</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Booking Ref</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">INV-{p.id}</TableCell>
                <TableCell className="font-mono text-xs">BK-{p.booking_id}</TableCell>
                <TableCell className="font-medium">{p.guestName || "N/A"}</TableCell>
                <TableCell className="uppercase">{p.method}</TableCell>
                <TableCell>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs",
                    p.status === "PAID" && "bg-emerald-100 text-emerald-700",
                    p.status === "UNPAID" && "bg-amber-100 text-amber-700",
                  )}>{p.status}</span>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNPR(p.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
