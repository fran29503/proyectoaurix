"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSignOut } from "@/lib/hooks/use-user";
import { useTenant } from "@/lib/tenant";
import { useLanguage } from "@/lib/i18n";
import { useCurrentUser, type Resource } from "@/lib/rbac";
import { useState, useMemo } from "react";

type NavKey = "dashboard" | "leads" | "pipeline" | "properties" | "tasks" | "team" | "reports" | "settings";

interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
}

const navigationConfig: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "leads", href: "/dashboard/leads", icon: Users },
  { key: "pipeline", href: "/dashboard/pipeline", icon: KanbanSquare },
  { key: "properties", href: "/dashboard/properties", icon: Building2 },
  { key: "tasks", href: "/dashboard/tasks", icon: ClipboardList },
  { key: "team", href: "/dashboard/team", icon: UsersRound },
  { key: "reports", href: "/dashboard/reports", icon: BarChart3 },
];

const secondaryNavigationConfig: NavItem[] = [
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

function NavItemComponent({
  item,
  name,
  isActive,
  index,
}: {
  item: NavItem;
  name: string;
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
          {name}
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
  const { branding, isFeatureEnabled } = useTenant();
  const { t } = useLanguage();
  const { user, canAccessNavItem, loading: userLoading } = useCurrentUser();

  // Get translated name for navigation item
  const getNavName = (key: NavKey): string => {
    return t.nav[key] || key;
  };

  // Get translated role name
  const getRoleName = (role: string): string => {
    const roleKey = role as keyof typeof t.roles;
    return t.roles[roleKey] || role;
  };

  // Filter navigation based on enabled features AND user permissions
  const filteredNavigation = useMemo(() => {
    const featureMap: Record<string, string> = {
      "/dashboard/leads": "leads",
      "/dashboard/pipeline": "leads",
      "/dashboard/properties": "properties",
      "/dashboard/tasks": "tasks",
      "/dashboard/team": "team",
      "/dashboard/reports": "reports",
    };

    // Map NavKey to Resource for permission checking
    const resourceMap: Record<NavKey, Resource> = {
      dashboard: "dashboard",
      leads: "leads",
      pipeline: "pipeline",
      properties: "properties",
      tasks: "tasks",
      team: "team",
      reports: "reports",
      settings: "settings",
    };

    return navigationConfig.filter((item) => {
      // Check tenant feature flag
      const feature = featureMap[item.href];
      if (feature && !isFeatureEnabled(feature)) return false;

      // Check user permission
      const resource = resourceMap[item.key];
      if (!canAccessNavItem(resource)) return false;

      return true;
    });
  }, [isFeatureEnabled, canAccessNavItem]);

  // Filter secondary navigation based on permissions
  const filteredSecondaryNav = useMemo(() => {
    const resourceMap: Record<NavKey, Resource> = {
      dashboard: "dashboard",
      leads: "leads",
      pipeline: "pipeline",
      properties: "properties",
      tasks: "tasks",
      team: "team",
      reports: "reports",
      settings: "settings",
    };

    return secondaryNavigationConfig.filter((item) => {
      const resource = resourceMap[item.key];
      return canAccessNavItem(resource);
    });
  }, [canAccessNavItem]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      data-sidebar
      className="flex h-full w-64 flex-col bg-slate-900 dark:bg-slate-950"
    >
      {/* Logo - Dynamic based on tenant branding */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex h-16 items-center gap-3 px-5"
      >
        <div className="relative">
          {branding.logoWhiteUrl ? (
            <Image
              src={branding.logoWhiteUrl}
              alt={branding.companyName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})`,
                boxShadow: `0 10px 15px -3px ${branding.primaryColor}40`,
              }}
            >
              <span className="text-lg font-bold text-white">
                {branding.companyShortName.charAt(0)}
              </span>
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{branding.companyName}</span>
          <span className="text-xs text-slate-500">{t.common.crmSubtitle}</span>
        </div>
      </motion.div>

      {/* Divider with gradient */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <NavItemComponent key={item.key} item={item} name={getNavName(item.key)} isActive={isActive} index={index} />
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 mx-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* Secondary nav */}
        <nav className="space-y-1">
          {filteredSecondaryNav.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <NavItemComponent
                key={item.key}
                item={item}
                name={getNavName(item.key)}
                isActive={isActive}
                index={navigationConfig.length + index}
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
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center text-white text-sm font-semibold">
                {user ? getInitials(user.fullName) : "?"}
              </div>
            )}
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-800",
              user?.isActive ? "bg-emerald-500" : "bg-slate-500"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userLoading ? "..." : (user?.fullName || "Guest")}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user ? getRoleName(user.role) : ""}
            </p>
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
            {signingOut ? t.common.loading : t.user.signOut}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
