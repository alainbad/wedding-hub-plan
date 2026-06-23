import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  Images,
  Inbox,
  CreditCard,
  CalendarDays,
  Star,
  Megaphone,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/profile", label: "My Profile", icon: Store },
  { to: "/dashboard/services", label: "Services & Packages", icon: Package },
  { to: "/dashboard/portfolio", label: "Portfolio", icon: Images },
  { to: "/dashboard/leads", label: "Leads & Requests", icon: Inbox },
  { to: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
] as const;

const soonItems = [
  { label: "Availability", icon: CalendarDays },
  { label: "Reviews", icon: Star },
  { label: "Promotions", icon: Megaphone },
  { label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="font-serif text-xl font-semibold tracking-tight text-primary">WeddingHub</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">Pro</span>
        </Link>
        <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.to, item.exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive("/admin")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        )}

        <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
          Coming soon
        </div>
        {soonItems.map((item) => (
          <div
            key={item.label}
            className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          View website
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6 text-foreground" />
        </button>
        <span className="font-serif text-lg font-semibold text-primary">WeddingHub Pro</span>
        <span className="w-6" />
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card md:block">
          {SidebarContent}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl">{SidebarContent}</aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
