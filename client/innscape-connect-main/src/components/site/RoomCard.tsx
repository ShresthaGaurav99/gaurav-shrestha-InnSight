import { Link } from "@tanstack/react-router";
import { Star, Users, Maximize2 } from "lucide-react";
import type { Room } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/lib/format";

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="group hover-lift overflow-hidden rounded-2xl border border-border bg-card card-soft">
      <Link to="/rooms/$roomId" params={{ roomId: String(room.id) }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={room.image}
            alt={room.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {room.type}
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {room.rating}
          </div>
        </div>
      </Link>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold">{room.name}</h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {room.capacity}</span>
          <span className="inline-flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" /> {room.size} m²</span>
          <span>{room.beds}</span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground">From</div>
            <div className="font-display text-xl font-semibold">
              {formatNPR(room.price)}<span className="text-xs font-normal text-muted-foreground"> /night</span>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/rooms/$roomId" params={{ roomId: String(room.id) }}>View</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
