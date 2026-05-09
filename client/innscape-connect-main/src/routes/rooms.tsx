import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { API_URL } from "@/lib/auth";
import { SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RoomCard } from "@/components/site/RoomCard";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
  head: () => ({
    meta: [
      { title: "Rooms & Suites — InnSight" },
      { name: "description", content: "Browse all rooms and suites at InnSight with smart filters." },
    ],
  }),
});

const TYPES = ["Standard", "Deluxe", "Executive", "Presidential"] as const;
const ALL_AMENITIES = ["Wifi", "Breakfast", "Mountain View", "City View", "Mini Bar", "Workspace", "Butler"];

function RoomsPage() {
  const [price, setPrice] = useState<[number]>([40000]);
  const [types, setTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [dbRooms, setDbRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/rooms`)
      .then(r => r.json())
      .then(data => {
        // map backend properties to what frontend expects if needed, or just set it
        // The backend returns rooms with image_url, etc.
        const formatted = data.map((d: any) => ({
          ...d,
          image: d.image_url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800",
          amenities: Array.isArray(d.amenities) ? d.amenities : []
        }));
        setDbRooms(formatted);
      })
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return dbRooms.filter((r) => {
      if (r.price > price[0]) return false;
      if (types.length && !types.includes(r.type)) return false;
      if (amenities.length && !amenities.every((a) => r.amenities.includes(a))) return false;
      return true;
    });
  }, [price, types, amenities, dbRooms]);

  const toggle = (arr: string[], v: string, set: (n: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">Rooms</span>
        </nav>
        <h1 className="mt-3 font-display text-4xl font-semibold">Rooms & suites</h1>
        <p className="mt-2 text-muted-foreground">{filtered.length} stays available</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-border bg-card p-6 card-soft lg:sticky lg:top-24">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Max price / night</Label>
              <Slider min={5000} max={50000} step={500} value={price} onValueChange={(v) => setPrice([v[0]])} />
              <div className="text-sm font-medium">Up to NPR {price[0].toLocaleString()}</div>
            </div>

            <div className="mt-6">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Room type</Label>
              <div className="mt-2 space-y-2">
                {TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={types.includes(t)} onCheckedChange={() => toggle(types, t, setTypes)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Amenities</Label>
              <div className="mt-2 space-y-2">
                {ALL_AMENITIES.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={amenities.includes(a)} onCheckedChange={() => toggle(amenities, a, setAmenities)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => <RoomCard key={r.id} room={r} />)}
            {!filtered.length && (
              <div className="col-span-full rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                No rooms match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
