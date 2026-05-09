import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarRange, BedDouble, UserCog, Settings,
  TrendingUp, Users, Wallet, UserPlus,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { stats, revenueWeek } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNPR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_URL, auth } from "@/lib/auth";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — InnSight" }] }),
});

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarRange },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "inventory", label: "Room Inventory", icon: BedDouble },
  { id: "staff", label: "Manage Staff", icon: UserCog },
  { id: "settings", label: "Settings", icon: Settings },
];

function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const navigate = useNavigate();
  const session = auth.get();

  useEffect(() => {
    if (!session || (session.role !== "manager" && session.role !== "admin")) {
      navigate({ to: "/auth", replace: true });
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <DashboardShell
      roleLabel="Admin portal"
      user={{ name: session.name, email: session.email }}
      nav={NAV}
      active={tab}
      onNavigate={setTab}
    >
      {tab === "overview" && <Overview />}
      {tab === "bookings" && <BookingsTable />}
      {tab === "payments" && <PaymentsTable />}
      {tab === "inventory" && <Inventory />}
      {tab === "staff" && <StaffMgmt />}
      {tab === "settings" && <SettingsView />}
    </DashboardShell>
  );
}

function Overview() {
  const max = Math.max(...revenueWeek.map((r) => r.value));
  const [realRevenue, setRealRevenue] = useState(0);
  const headers = useAuthHeaders();
  
  useEffect(() => {
    fetch(`${API_URL}/billing`, { headers })
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const paid = data.filter(p => p.status === 'PAID');
          const sum = paid.reduce((acc, p) => acc + Number(p.amount), 0);
          setRealRevenue(sum);
        }
      })
      .catch(console.error);
  }, [headers]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total revenue" value={formatNPR(realRevenue > 0 ? realRevenue : stats.revenue)} icon={Wallet} trend="Real-time" />
        <Stat label="Occupancy" value={`${stats.occupancy}%`} icon={TrendingUp} trend="+3.1%" />
        <Stat label="Active guests" value={stats.activeGuests.toString()} icon={Users} trend="+8" />
        <Stat label="New users" value={stats.newUsers.toString()} icon={UserPlus} trend="+5" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 card-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Revenue this week</h3>
          <span className="text-xs text-muted-foreground">NPR</span>
        </div>
        <div className="mt-6 flex h-48 items-end gap-3">
          {revenueWeek.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={formatNPR(d.value)}
              />
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 card-soft">
        <h3 className="font-display text-lg font-semibold">Recent bookings</h3>
        <div className="mt-3"><BookingsTable embedded /></div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, trend }: {
  label: string; value: string; icon: typeof Wallet; trend: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs font-medium text-emerald-600">{trend} vs last period</div>
    </div>
  );
}

function useAuthHeaders(): Record<string, string> {
  const session = auth.get();
  return session ? { "Authorization": `Bearer ${session.token}` } : {};
}

function BookingsTable({ embedded }: { embedded?: boolean }) {
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbRooms, setDbRooms] = useState<any[]>([]);
  const headers = useAuthHeaders();

  useEffect(() => {
    fetch(`${API_URL}/bookings`, { headers })
      .then(r => r.json())
      .then(setDbBookings).catch(console.error);
    fetch(`${API_URL}/rooms`)
      .then(r => r.json())
      .then(setDbRooms).catch(console.error);
  }, [headers]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setDbBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        toast.success(`Booking ${id} ${status}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch(e) { toast.error("Error updating status"); }
  };

  const Body = (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Guest ID</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dbBookings.map((b) => {
            const room = dbRooms.find((r) => r.id === b.room_id);
            return (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell className="font-medium">{b.user_id}</TableCell>
                <TableCell>{room?.type || `Room ${b.room_id}`}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(b.check_in).toLocaleDateString()} → {new Date(b.check_out).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs",
                    b.status === "confirmed" && "bg-emerald-100 text-emerald-700",
                    b.status === "pending" && "bg-amber-100 text-amber-700",
                    b.status === "completed" && "bg-secondary text-foreground",
                  )}>{b.status}</span>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNPR(b.total_price)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'confirmed')}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'cancelled')}>Cancel</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
  if (embedded) return Body;
  return <div className="rounded-2xl border border-border bg-card p-5 card-soft">{Body}</div>;
}

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
        <h3 className="font-display text-lg font-semibold">Payment History</h3>
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

function Inventory() {
  const [dbRooms, setDbRooms] = useState<any[]>([]);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const headers = useAuthHeaders();

  const fetchRooms = () => {
    fetch(`${API_URL}/rooms`)
      .then(r => r.json())
      .then(data => {
        setDbRooms(data.map((d: any) => ({
          ...d, image: d.image_url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"
        })));
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const isNew = editingRoom === 'new';
      const url = isNew ? `${API_URL}/rooms` : `${API_URL}/rooms/${editingRoom.id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method, headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(isNew ? "Room added" : "Room updated");
        setEditingRoom(null);
        fetchRooms();
      } else {
        const error = await res.json();
        toast.error(`Failed: ${error.message}`);
      }
    } catch (err) {
      toast.error("Error saving room.");
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dbRooms.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card card-soft">
            <img src={r.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-base font-semibold">Room {r.number || r.room_number || r.id}</div>
                  <div className="text-xs text-muted-foreground">{r.type} · Capacity: {r.capacity}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatNPR(r.price)}</div>
                  <div className="text-[11px] text-muted-foreground">/ night</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingRoom(r)}>Edit Room</Button>
              </div>
            </div>
          </div>
        ))}
        <div className="grid place-items-center rounded-2xl border-2 border-dashed border-border p-10 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer" onClick={() => setEditingRoom('new')}>
          + Add new room
        </div>
      </div>

      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="mb-4 font-display text-lg font-semibold">
              {editingRoom === 'new' ? 'Add New Room' : 'Edit Room'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Room Number</label>
                  <input name="number" required defaultValue={editingRoom !== 'new' ? (editingRoom.number || editingRoom.room_number) : ''} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Type</label>
                  <select name="type" required defaultValue={editingRoom !== 'new' ? editingRoom.type : 'Deluxe'} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Price (NPR)</label>
                  <input type="number" name="price" required defaultValue={editingRoom !== 'new' ? editingRoom.price : ''} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Capacity</label>
                  <input type="number" name="capacity" required defaultValue={editingRoom !== 'new' ? editingRoom.capacity : '2'} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditingRoom(null)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function StaffMgmt() {
  const [dbStaff, setDbStaff] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const headers = useAuthHeaders();

  const fetchStaff = () => {
    fetch(`${API_URL}/staff`, { headers })
      .then(r => r.json())
      .then(setDbStaff).catch(console.error);
  };

  useEffect(() => {
    fetchStaff();
  }, [headers]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Staff created. Verification email sent.");
        setIsAdding(false);
        fetchStaff();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create staff");
      }
    } catch (e) {
       toast.error("Error creating staff");
    }
  };

  const removeStaff = async (id: string, name: string) => {
     if (!confirm(`Are you sure you want to remove ${name}?`)) return;
     try {
       const res = await fetch(`${API_URL}/staff/${id}`, {
         method: "DELETE", headers
       });
       if (res.ok) {
         toast.success("Staff removed");
         fetchStaff();
       } else {
         toast.error("Failed to remove staff");
       }
     } catch (e) {
       toast.error("Error removing staff");
     }
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card card-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h3 className="font-display text-lg font-semibold">Staff accounts</h3>
          <Button onClick={() => setIsAdding(true)}>+ Add staff</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dbStaff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="capitalize">{s.role}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => removeStaff(s.id, s.name)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="mb-4 font-display text-lg font-semibold">Add Staff Member</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Full Name</label>
                <input name="name" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Email</label>
                <input type="email" name="email" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Temporary Password</label>
                <input type="password" name="password" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Role</label>
                <select name="role" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit">Create Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsView() {
  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 card-soft">
      <h3 className="font-display text-lg font-semibold">Property settings</h3>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved."); }}
      >
        <div><Label>Property name</Label><Input defaultValue="InnSight Kathmandu" className="mt-1.5" /></div>
        <div><Label>Contact</Label><Input defaultValue="+977 1 5557788" className="mt-1.5" /></div>
        <div><Label>Tax rate (%)</Label><Input defaultValue="13" className="mt-1.5" /></div>
        <div><Label>Currency</Label><Input defaultValue="NPR" className="mt-1.5" /></div>
        <div className="sm:col-span-2 flex justify-end"><Button type="submit">Save changes</Button></div>
      </form>
    </div>
  );
}
