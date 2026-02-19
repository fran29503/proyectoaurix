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
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSignOut } from "@/lib/hooks/use-user";
import { useTenant } from "@/lib/tenant";
import { useLanguage } from "@/lib/i18n";
import { useCurrentUser, type Resource } from "@/lib/rbac";
import { useState, useMemo, useEffect, createContext, useContext } from "react";

// --- Mobile sidebar context ---
const MobileSidebarContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}>({ open: false, setOpen: () => {}, toggle: () => {} });

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  // Close on route change
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <MobileSidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

// --- Types ---
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

// --- Nav item component ---
function NavItemComponent({
  item,
  name,
  isActive,
  index,
  onNavigate,
}: {
  item: NavItem;
  name: string;
  isActive: boolean;
  index: number;
  onNavigate?: () => void;
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
        onClick={onNavigate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-white"
            : "text-slate-400 hover:text-white"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavBg"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

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

        <ChevronRight className={cn(
          "ml-auto h-4 w-4 relative z-10 opacity-0 -translate-x-2 transition-all duration-200",
          (isActive || isHovered) && "opacity-100 translate-x-0"
        )} />
      </Link>
    </motion.div>
  );
}

// --- Sidebar content (shared between desktop and mobile) ---
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { signOut, loading: signingOut } = useSignOut();
  const { branding } = useTenant();
  const { t } = useLanguage();
  const { user, canAccessNavItem, loading: userLoading } = useCurrentUser();

  const getNavName = (key: NavKey): string => t.nav[key] || key;
  const getRoleName = (role: string): string => {
    const roleKey = role as keyof typeof t.roles;
    return t.roles[roleKey] || role;
  };

  const { isFeatureEnabled } = useTenant();

  const filteredNavigation = useMemo(() => {
    const featureMap: Record<string, string> = {
      "/dashboard/leads": "leads",
      "/dashboard/pipeline": "leads",
      "/dashboard/properties": "properties",
      "/dashboard/tasks": "tasks",
      "/dashboard/team": "team",
      "/dashboard/reports": "reports",
    };
    const resourceMap: Record<NavKey, Resource> = {
      dashboard: "dashboard", leads: "leads", pipeline: "pipeline",
      properties: "properties", tasks: "tasks", team: "team",
      reports: "reports", settings: "settings",
    };
    return navigationConfig.filter((item) => {
      const feature = featureMap[item.href];
      if (feature && !isFeatureEnabled(feature)) return false;
      const resource = resourceMap[item.key];
      if (!canAccessNavItem(resource)) return false;
      return true;
    });
  }, [isFeatureEnabled, canAccessNavItem]);

  const filteredSecondaryNav = useMemo(() => {
    const resourceMap: Record<NavKey, Resource> = {
      dashboard: "dashboard", leads: "leads", pipeline: "pipeline",
      properties: "properties", tasks: "tasks", team: "team",
      reports: "reports", settings: "settings",
    };
    return secondaryNavigationConfig.filter((item) => {
      const resource = resourceMap[item.key];
      return canAccessNavItem(resource);
    });
  }, [canAccessNavItem]);

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 flex-shrink-0">
        <div className="relative">
          {branding.logoWhiteUrl ? (
            <Image src={branding.logoWhiteUrl} alt={branding.companyName} width={40} height={40} className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})`,
                boxShadow: `0 10px 15px -3px ${branding.primaryColor}40`,
              }}
            >
              <span className="text-lg font-bold text-white">{branding.companyShortName.charAt(0)}</span>
            </div>
          )}
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{branding.companyName}</span>
          <span className="text-xs text-slate-500">{t.common.crmSubtitle}</span>
        </div>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <NavItemComponent key={item.key} item={item} name={getNavName(item.key)} isActive={isActive} index={index} onNavigate={onNavigate} />
            );
          })}
        </nav>

        <div className="my-4 mx-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <nav className="space-y-1">
          {filteredSecondaryNav.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <NavItemComponent key={item.key} item={item} name={getNavName(item.key)} isActive={isActive} index={navigationConfig.length + index} onNavigate={onNavigate} />
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-3 space-y-3 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3">
          <div className="relative">
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.fullName} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
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

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
          onClick={signOut}
          disabled={signingOut}
        >
          <LogOut className="h-5 w-5" />
          {signingOut ? t.common.loading : t.user.signOut}
        </Button>
      </div>
    </>
  );
}

// --- Mobile hamburger button (used in header) ---
export function MobileMenuButton() {
  const { toggle } = useMobileSidebar();
  return (
    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl" onClick={toggle}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}

// --- Mobile sidebar overlay ---
export function MobileSidebar() {
  const { open, setOpen } = useMobileSidebar();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            data-sidebar
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-900 dark:bg-slate-950 shadow-2xl lg:hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Desktop sidebar ---
export function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        data-sidebar
        className="hidden lg:flex h-full w-64 flex-col bg-slate-900 dark:bg-slate-950"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile sidebar overlay */}
      <MobileSidebar />
    </>
  );
}
