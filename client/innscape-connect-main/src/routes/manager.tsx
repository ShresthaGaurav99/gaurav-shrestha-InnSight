import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarRange, BedDouble, UserCog, TrendingUp, Users, Wallet, Clock, Hotel,
} from "lucide-react";
import { stats } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNPR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { auth, API_URL } from "@/lib/auth";

export const Route = createFileRoute("/manager")({
  component: Manager,
  head: () => ({ meta: [{ title: "Manager — InnSight" }] }),
});

const NAV = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarRange },
  { id: "inventory", label: "Room Inventory", icon: BedDouble },
  { id: "attendance", label: "Staff Attendance", icon: UserCog },
];

function Manager() {
  const [tab, setTab] = useState("overview");
  const [clockedIn, setClockedIn] = useState(false);
  const navigate = useNavigate();
  const session = auth.get();

  useEffect(() => {
    if (!session || (session.role !== "manager" && session.role !== "admin")) {
      navigate({ to: "/auth", replace: true });
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr] bg-secondary/30">
      <aside className="hidden border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Hotel className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold">Inn<span className="text-gold">Sight</span></span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="rounded-xl bg-primary p-4 text-primary-foreground">
            <div className="text-xs opacity-80">Manager</div>
            <div className="font-medium">{session.name}</div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Manager portal</div>
            <h1 className="font-display text-xl font-semibold">{NAV.find((n) => n.id === tab)?.label}</h1>
          </div>
          <Button asChild variant="outline" size="sm"><Link to="/">Back to site</Link></Button>
        </header>

        <main className="flex-1 p-6">
          {/* mobile tabs */}
          <Tabs value={tab} onValueChange={setTab} className="mb-6 lg:hidden">
            <TabsList className="grid w-full grid-cols-4">
              {NAV.map((n) => <TabsTrigger key={n.id} value={n.id}>{n.label.split(" ")[0]}</TabsTrigger>)}
            </TabsList>
            <TabsContent value={tab} />
          </Tabs>

          {tab === "overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Revenue (mo.)" value={formatNPR(stats.revenue)} icon={Wallet} trend="+12.4%" />
                <Stat label="Occupancy" value={`${stats.occupancy}%`} icon={TrendingUp} trend="+3.1%" />
                <Stat label="Active guests" value={stats.activeGuests.toString()} icon={Users} trend="+8" />
                <Stat label="Bookings today" value={stats.bookingsToday.toString()} icon={CalendarRange} trend="+5" />
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 card-soft">
                <h3 className="font-display text-lg font-semibold">Recent bookings</h3>
                <BookingsTable />
              </div>
            </>
          )}

          {tab === "bookings" && (
            <div className="rounded-2xl border border-border bg-card p-6 card-soft">
              <BookingsTable />
            </div>
          )}

          {tab === "inventory" && <InventoryTable />}

          {tab === "attendance" && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <AttendanceTable />
              <div className="h-fit rounded-2xl border border-border bg-card p-6 card-elevated">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Your shift</div>
                <div className="mt-1 font-display text-2xl font-semibold">
                  {clockedIn ? "On the clock" : "Off duty"}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <Button
                  onClick={() => {
                    setClockedIn((v) => !v);
                    toast.success(clockedIn ? "Clocked out." : "Clocked in.");
                  }}
                  className={cn(
                    "mt-5 h-12 w-full text-base",
                    clockedIn ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              : "bg-gold text-gold-foreground hover:bg-gold/90",
                  )}
                >
                  {clockedIn ? "Clock out" : "Clock in"}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BookingsTable() {
  const [bookings, setBookings] = useState<any[]>([]);
  const session = auth.get();

  useEffect(() => {
    if (!session) return;
    fetch(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((r) => r.json())
      .then(setBookings)
      .catch(console.error);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    if (!session) return;
    try {
      const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: status.toUpperCase() } : b));
        toast.success(`Booking ${id} updated to ${status}`);
      } else {
        toast.error("Failed to update booking");
      }
    } catch { toast.error("Network error"); }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Guest</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-mono text-xs">#{b.id}</TableCell>
            <TableCell className="font-medium">{b.guestName || `User ${b.user_id}`}</TableCell>
            <TableCell>{b.room_type || b.room_title || `Room ${b.room_number}`}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(b.checkIn || b.check_in).toLocaleDateString()} → {new Date(b.checkOut || b.check_out).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <span className={cn("rounded-full px-2.5 py-1 text-xs",
                (b.status === "CONFIRMED" || b.status === "CHECKED_IN") && "bg-emerald-100 text-emerald-700",
                b.status === "PENDING" && "bg-amber-100 text-amber-700",
                (b.status === "COMPLETED" || b.status === "CANCELLED") && "bg-secondary text-foreground",
              )}>{b.status}</span>
            </TableCell>
            <TableCell className="text-right font-medium">{formatNPR(b.totalAmount || b.total_price || 0)}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "CONFIRMED")}>Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "CANCELLED")}>Cancel</Button>
            </TableCell>
          </TableRow>
        ))}
        {bookings.length === 0 && (
          <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings found.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function InventoryTable() {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/rooms`)
      .then((r) => r.json())
      .then(setRooms)
      .catch(console.error);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card card-soft">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h3 className="font-display text-lg font-semibold">Room inventory</h3>
        <Button onClick={() => toast.success("Feature coming soon!")}>+ Add room</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Price / night</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.number || r.room_number || r.id}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.capacity ?? "—"}</TableCell>
              <TableCell>{formatNPR(r.price)}</TableCell>
              <TableCell>
                <span className={cn("rounded-full px-2.5 py-1 text-xs",
                  r.status === "available" || r.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700" :
                  r.status === "occupied" || r.status === "OCCUPIED" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                )}>{r.status}</span>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={() => toast.success("Edit coming soon!")}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AttendanceTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const session = auth.get();

  useEffect(() => {
    if (!session) return;
    fetch(`${API_URL}/attendance`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card card-soft">
      <div className="border-b border-border p-5">
        <h3 className="font-display text-lg font-semibold">Staff logs — today</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Clock in</TableHead>
            <TableHead>Clock out</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? logs.map((s, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{s.name || s.staff_name || "—"}</TableCell>
              <TableCell>{s.role || "—"}</TableCell>
              <TableCell>{s.clock_in ? new Date(s.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
              <TableCell>{s.clock_out ? new Date(s.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
              <TableCell>
                <span className={cn("rounded-full px-2.5 py-1 text-xs",
                  !s.clock_out ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-foreground")}>
                  {!s.clock_out ? "On shift" : "Done"}
                </span>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No attendance data for today.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function Stat({ label, value, icon: Icon, trend }: { label: string; value: string; icon: typeof Wallet; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs font-medium text-emerald-600">{trend} vs last period</div>
    </div>
  );
}
