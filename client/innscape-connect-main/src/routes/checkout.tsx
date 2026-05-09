import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
  import { useState, useEffect } from "react";
import { z } from "zod";
import { CreditCard, ShieldCheck, Building2 } from "lucide-react";
import { auth, API_URL } from "@/lib/auth";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatNPR } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/payment/PaymentModal";

const search = z.object({
  roomId: z.string().optional(),
  nights: z.coerce.number().optional(),
});

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  validateSearch: search,
  head: () => ({ meta: [{ title: "Checkout — InnSight" }] }),
});

type Method = "esewa" | "khalti" | "hotel";

const METHODS: { id: Method; name: string; sub: string; bg: string; ring: string; icon: React.ReactNode }[] = [
  {
    id: "esewa",
    name: "eSewa",
    sub: "Pay via eSewa wallet",
    bg: "bg-[#0F8C3B]",
    ring: "ring-[#0F8C3B] border-[#0F8C3B]",
    icon: <span className="font-bold">e</span>,
  },
  {
    id: "khalti",
    name: "Khalti",
    sub: "Pay via Khalti wallet",
    bg: "bg-[#5C2D91]",
    ring: "ring-[#5C2D91] border-[#5C2D91]",
    icon: <span className="font-bold">K</span>,
  },
  {
    id: "hotel",
    name: "Pay at Hotel",
    sub: "Settle at reception",
    bg: "bg-primary",
    ring: "ring-primary border-primary",
    icon: <Building2 className="h-4 w-4" />,
  },
];

function Checkout() {
  const { roomId, nights = 2 } = Route.useSearch();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<Method>("esewa");
  const [modal, setModal] = useState<"esewa" | "khalti" | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/rooms/${roomId}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.message) {
          setRoom({
            ...data,
            name: data.title || `${data.type} Room ${data.number}`,
            image: data.image_urls && data.image_urls.length > 0 ? data.image_urls[0] : "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="text-lg text-muted-foreground">Loading checkout details...</p>
        </div>
      </SiteLayout>
    );
  }

  if (!room) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Room not found</h1>
          <Button asChild className="mt-4"><Link to="/rooms">Go back</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  const subtotal = room.price * nights;
  const tax = Math.round(subtotal * 0.13);
  const total = subtotal + tax;

  const ref = `BK-${Math.floor(Math.random() * 90000 + 10000)}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const guestName = `${formData.get("firstName")} ${formData.get("lastName")}`;
    const guestEmail = formData.get("email");
    const phone = formData.get("phone");

    const session = auth.get();
    
    // Convert to Date strings
    const checkIn = new Date().toISOString();
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + nights);
    const checkOut = checkOutDate.toISOString();

    const payload = {
      roomId,
      guestName,
      guestEmail,
      phone,
      checkIn,
      checkOut,
    };

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        toast.error("Failed to create booking");
        return;
      }

      const json = await res.json();
      const newBooking = json.booking;

      if (method === "hotel") {
        toast.success("Booking reserved! Pay at reception.");
        try {
          const session = auth.get();
          await fetch(`${API_URL}/billing`, {
            method: "POST", headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
            body: JSON.stringify({ bookingId: newBooking.id, amount: total, method: "CASH" })
          });
        } catch (e) {}

        navigate({
          to: "/payment-success",
          search: { ref: `BK-${newBooking.id}`, method: "hotel", amount: total },
        });
        return;
      }
      setCreatedBookingId(newBooking.id);
      setModal(method);
    } catch (e) {
      toast.error("Error creating booking");
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Checkout</h1>
        <p className="mt-1 text-muted-foreground">Review your stay and complete your booking.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 card-soft">
              <h2 className="font-display text-xl font-semibold">Guest details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="firstName" label="First name" required />
                <Field id="lastName" label="Last name" required />
                <Field id="email" label="Email" type="email" required />
                <Field id="phone" label="Phone" required />
                <Field id="notes" label="Special requests" placeholder="Late check-in, dietary needs…" className="sm:col-span-2" />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 card-soft">
              <h2 className="font-display text-xl font-semibold">Payment method</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {METHODS.map((p) => {
                  const active = method === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setMethod(p.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                        active
                          ? `ring-2 bg-secondary/40 ${p.ring}`
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-white", p.bg)}>
                        {p.icon}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5 sm:p-6 card-elevated lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <div className="mt-4 flex gap-3">
              <img src={room.image} alt="" className="h-20 w-24 rounded-lg object-cover" />
              <div className="text-sm">
                <div className="font-medium">{room.name}</div>
                <div className="text-muted-foreground">
                  {nights} {nights === 1 ? "night" : "nights"} · {room.type}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatNPR(subtotal)} />
              <Row label="Taxes (13%)" value={formatNPR(tax)} />
              <Separator className="my-2" />
              <Row label="Total" value={formatNPR(total)} bold />
            </div>
            <Button type="submit" className="mt-5 h-11 w-full bg-gold text-gold-foreground hover:bg-gold/90">
              {method === "hotel" ? "Reserve & pay later" : `Pay with ${METHODS.find((m) => m.id === method)?.name}`}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Secured with end-to-end encryption
            </p>
            <Link to="/rooms" className="mt-2 block text-center text-xs text-muted-foreground hover:underline">
              ← Continue browsing
            </Link>
          </aside>
        </form>
      </div>

      {modal && (
        <PaymentModal
          open={!!modal}
          provider={modal}
          amount={total}
          onClose={() => setModal(null)}
          onSuccess={async () => {
            setModal(null);
            
            try {
              const session = auth.get();
              await fetch(`${API_URL}/billing`, {
                method: "POST", headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
                body: JSON.stringify({ bookingId: createdBookingId, amount: total, method: modal.toUpperCase() })
              });
            } catch (e) {}
            
            navigate({ to: "/payment-success", search: { ref: `BK-${createdBookingId}`, method: modal, amount: total } });
          }}
        />
      )}
    </SiteLayout>
  );
}

function Field({
  id, label, type = "text", required, placeholder, className,
}: { id: string; label: string; type?: string; required?: boolean; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} placeholder={placeholder} className="mt-1.5" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "text-base font-semibold")}>
      <span className={cn(!bold && "text-muted-foreground")}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// CreditCard intentionally imported (kept for future card option)
void CreditCard;
