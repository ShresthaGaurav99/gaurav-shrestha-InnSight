import { Link } from "@tanstack/react-router";
import { Hotel, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">
              Inn<span className="text-gold">Sight</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Refined hospitality crafted for the modern traveller.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/rooms" className="hover:text-foreground">Rooms</Link></li>
            <li><Link to="/customer-dashboard" className="hover:text-foreground">My Stays</Link></li>
            <li><Link to="/manager" className="hover:text-foreground">Manager Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Thamel, Kathmandu</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +977 1 555 0199</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> stay@innsight.com</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Newsletter</h4>
          <p className="mt-3 text-sm text-muted-foreground">Quiet updates, exceptional offers.</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              console.log("newsletter:", Object.fromEntries(fd));
              toast.success("You're on the list.");
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <Input name="email" type="email" required placeholder="you@email.com" />
            <Button type="submit">Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} InnSight Hospitality. All rights reserved.
      </div>
    </footer>
  );
}
