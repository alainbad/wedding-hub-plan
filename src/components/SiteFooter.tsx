import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-semibold text-primary">WeddingHub</span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Lebanon</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Lebanon's directory of trusted wedding creatives. Browse, compare and connect with
              verified venues, photographers, florists and more.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Mail].map((Icon, i) => (
                <span
                  key={i}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/creatives" className="hover:text-foreground">All creatives</Link></li>
              <li><Link to="/creatives" search={{ category: "venues" }} className="hover:text-foreground">Venues</Link></li>
              <li><Link to="/creatives" search={{ category: "photography" }} className="hover:text-foreground">Photographers</Link></li>
            </ul>
          </div>


          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">About</span></li>
              <li><span className="cursor-default">Contact</span></li>
              <li><span className="cursor-default">Terms</span></li>
              <li><span className="cursor-default">Privacy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} WeddingHub Lebanon · Demo prototype
        </div>
      </div>
    </footer>
  );
}
