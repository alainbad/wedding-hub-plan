import { Link } from "@tanstack/react-router";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import type { Supplier } from "@/data/suppliers";
import { cn } from "@/lib/utils";

const tierStyles: Record<Supplier["tier"], string> = {
  Featured: "bg-secondary text-secondary-foreground",
  Premium: "bg-accent/20 text-accent-foreground",
  Elite: "bg-primary text-primary-foreground",
};

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <Link
      to="/supplier/$supplierId"
      params={{ supplierId: supplier.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={supplier.image}
          alt={supplier.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
            tierStyles[supplier.tier],
          )}
        >
          {supplier.tier}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {supplier.city}, {supplier.region}
        </div>
        <h3 className="mt-1.5 flex items-center gap-1.5 font-serif text-xl font-semibold leading-tight text-foreground">
          {supplier.name}
          {supplier.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{supplier.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" />
            {supplier.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">({supplier.reviews})</span>
          </span>
          <span className="text-sm text-muted-foreground">
            from <span className="font-semibold text-foreground">${supplier.priceFrom.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
