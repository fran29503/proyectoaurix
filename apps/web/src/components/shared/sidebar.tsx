"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  KanbanSquare,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSignOut } from "@/lib/hooks/use-user";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    name: "Pipeline",
    href: "/dashboard/pipeline",
    icon: KanbanSquare,
  },
  {
    name: "Properties",
    href: "/dashboard/properties",
    icon: Building2,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, loading: signingOut } = useSignOut();

  return (
    <div className="flex h-full w-64 flex-col bg-navy-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper-500">
          <span className="text-lg font-bold text-white">M</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Meridian Harbor</span>
          <span className="text-xs text-slate-400">Realty</span>
        </div>
      </div>

      <Separator className="bg-navy-800" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-copper-500/10 text-copper-500"
                    : "text-slate-400 hover:bg-navy-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 bg-navy-800" />

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-copper-500/10 text-copper-500"
                    : "text-slate-400 hover:bg-navy-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Sign out */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:bg-navy-800 hover:text-white"
          onClick={signOut}
          disabled={signingOut}
        >
          <LogOut className="h-5 w-5" />
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
