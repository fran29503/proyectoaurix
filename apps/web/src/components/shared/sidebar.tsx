"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  KanbanSquare,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  UsersRound,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSignOut } from "@/lib/hooks/use-user";
import { useState } from "react";

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
    name: "Team",
    href: "/dashboard/team",
    icon: UsersRound,
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

function NavItem({
  item,
  isActive,
  index,
}: {
  item: (typeof navigation)[0];
  isActive: boolean;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={item.href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-white"
            : "text-slate-400 hover:text-white"
        )}
      >
        {/* Background glow for active state */}
        {isActive && (
          <motion.div
            layoutId="activeNavBg"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        {/* Hover background */}
        <AnimatePresence>
          {isHovered && !isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 rounded-xl bg-white/5"
            />
          )}
        </AnimatePresence>

        <span className="relative z-10 flex items-center gap-3">
          <item.icon className={cn(
            "h-5 w-5 transition-transform duration-200",
            isHovered && !isActive && "scale-110"
          )} />
          {item.name}
        </span>

        {/* Arrow indicator */}
        <ChevronRight className={cn(
          "ml-auto h-4 w-4 relative z-10 opacity-0 -translate-x-2 transition-all duration-200",
          (isActive || isHovered) && "opacity-100 translate-x-0"
        )} />
      </Link>
    </motion.div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, loading: signingOut } = useSignOut();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-64 flex-col bg-slate-900"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex h-16 items-center gap-3 px-5"
      >
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          {/* Online indicator */}
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Meridian Harbor</span>
          <span className="text-xs text-slate-500">Real Estate CRM</span>
        </div>
      </motion.div>

      {/* Divider with gradient */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <NavItem key={item.name} item={item} isActive={isActive} index={index} />
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 mx-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* Secondary nav */}
        <nav className="space-y-1">
          {secondaryNavigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <NavItem
                key={item.name}
                item={item}
                isActive={isActive}
                index={navigation.length + index}
              />
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="p-3 space-y-3"
      >
        {/* User card */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center text-white text-sm font-semibold">
              OA
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800 bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Omar Al-Mansouri</p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>

        {/* Sign out button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
            onClick={signOut}
            disabled={signingOut}
          >
            <LogOut className="h-5 w-5" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
