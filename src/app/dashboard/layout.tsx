"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  Zap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/leads", label: "Lead Pipeline", icon: Users },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo & Business Identity */}
      <div className="p-4 pb-3">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">
              BizWa <span className="text-primary">Agent</span>
            </span>
            <p className="text-[10px] text-muted-foreground font-medium">
              Owner Control Center
            </p>
          </div>
        </Link>
      </div>

      {/* Customer Assistant Launch Card */}
      <div className="px-3 pb-2">
        <Link href="/chat/demo" target="_blank" onClick={onNavigate}>
          <div className="bg-gradient-to-r from-primary/20 via-violet-500/20 to-emerald-500/20 border border-primary/40 rounded-xl p-2.5 flex items-center justify-between hover:border-primary transition-all group">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Customer Assistant
                </p>
                <p className="text-[10px] text-muted-foreground">Test customer chat live</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
          </div>
        </Link>
      </div>

      <Separator className="my-1 opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/15 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              <item.icon
                className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-1 opacity-50" />

      {/* Account Info Footer */}
      <div className="p-3">
        <div className="p-3 rounded-lg bg-card/60 border border-border/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold truncate">GoaTrip Adventures</span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-medium">
              Active
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">WhatsApp Business Account</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border/50 bg-sidebar flex-col shrink-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border/50 bg-background/95 backdrop-blur-md h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border/60 hover:bg-accent">
                <Menu className="w-4 h-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">BizWa Dashboard</span>
            </div>
          </div>

          <Link href="/chat/demo" target="_blank">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-primary/40 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Open Assistant
            </Button>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
