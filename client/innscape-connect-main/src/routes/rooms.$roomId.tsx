import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Wifi, Coffee, Mountain, Tv, Wind, Wine, Utensils, Bath, Briefcase, Sparkles, Star, Users, Maximize2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { API_URL } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatNPR } from "@/lib/format";

export const Route = createFileRoute("/rooms/$roomId")({
  component: RoomDetail,
});

const iconFor = (a: string) => {
  const m: Record<string, typeof Wifi> = {
    Wifi, Breakfast: Coffee, "Mountain View": Mountain, "City View": Mountain,
    "Smart TV": Tv, "Air Conditioning": Wind, "Mini Bar": Wine, Bar: Wine,
    "Spa Bath": Bath, Workspace: Briefcase, Butler: Sparkles, Fireplace: Utensils, "Private Lounge": Sparkles,
  };
  return m[a] ?? Sparkles;
};

function RoomDetail() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [nights, setNights] = useState(2);

  useEffect(() => {
    fetch(`${API_URL}/rooms/${roomId}`)
      .then(r => r.json())
      .then(data => {
        if (!data || data.message) {
          setRoom(null);
        } else {
          setRoom({
            ...data,
            name: data.title || `${data.type} Room ${data.number}`,
            gallery: data.image_urls && data.image_urls.length > 0 ? data.image_urls : ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"],
            rating: 4.8,
            beds: data.bed_type || "1 Queen Bed",
            size: data.size_sqft || 300,
            description: data.description || "A beautiful and relaxing space to enjoy your stay.",
            amenities: Array.isArray(data.amenities) && data.amenities.length > 0 ? data.amenities : ["Wifi", "Breakfast"]
          });
        }
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, [roomId]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-muted-foreground">Loading room...</h1>
        </div>
      </SiteLayout>
    );
  }

  if (!room) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Room not found</h1>
          <Button asChild className="mt-6"><Link to="/rooms">Back to rooms</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  const subtotal = room.price * nights;
  const tax = Math.round(subtotal * 0.13);
  const total = subtotal + tax;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
          <Link to="/rooms" className="hover:text-foreground">Rooms</Link> /{" "}
          <span className="text-foreground">{room.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-border card-soft">
              <img src={room.gallery[active]} alt={room.name} className="aspect-[16/10] w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {room.gallery.map((g: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-lg border ${i === active ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                >
                  <img src={g} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-8">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{room.type}</span>
              <h1 className="mt-3 font-display text-4xl font-semibold">{room.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-gold text-gold" /> {room.rating}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> Up to {room.capacity} guests</span>
                <span className="inline-flex items-center gap-1.5"><Maximize2 className="h-4 w-4" /> {room.size} m²</span>
                <span>{room.beds}</span>
              </div>
              <p className="mt-6 max-w-2xl leading-relaxed text-foreground/80">{room.description}</p>

              <h3 className="mt-10 font-display text-xl font-semibold">Amenities</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.amenities.map((a: string) => {
                  const Icon = iconFor(a);
                  return (
                    <div key={a} className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
                      <Icon className="h-4 w-4 text-gold" /> {a}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky booking */}
          <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 card-elevated">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{formatNPR(room.price)}</span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
            <Separator className="my-5" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Check-in</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Check-out</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Nights</Label>
                <Input type="number" min={1} max={30} value={nights} onChange={(e) => setNights(Number(e.target.value))} className="mt-1" />
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{formatNPR(room.price)} × {nights} nights</span><span>{formatNPR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Taxes & fees</span><span>{formatNPR(tax)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatNPR(total)}</span></div>
            </div>

            <Button
              className="mt-5 h-11 w-full bg-gold text-gold-foreground hover:bg-gold/90"
              onClick={() => navigate({ to: "/checkout", search: { roomId: room.id, nights } })}
            >
              Book now
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">No charges yet — review at checkout.</p>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
