"use client";

import { Bell, Search, Command, Sparkles, Users, Building2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSignOut } from "@/lib/hooks/use-user";
import { getInitials } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { LanguageSelector } from "./language-selector";
import { useLanguage } from "@/lib/i18n";
import { useCurrentUser } from "@/lib/rbac";
import { globalSearch, type SearchResult } from "@/lib/queries/search";
import { getNotifications, type Notification } from "@/lib/queries/notifications";
import { useRouter } from "next/navigation";

const typeIcons: Record<string, typeof Users> = {
  lead: Users,
  property: Building2,
  task: CheckSquare,
};

const typeColors: Record<string, string> = {
  lead: "text-violet-600 bg-violet-50 dark:bg-violet-900/30",
  property: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
  task: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
};

export function Header() {
  const { signOut } = useSignOut();
  const { t } = useLanguage();
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedIndex(-1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await globalSearch(value);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  }, []);

  // Keyboard navigation in results
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const result = searchResults[selectedIndex];
      router.push(result.href);
      setSearchQuery("");
      setSearchResults([]);
      searchInputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setSearchQuery("");
    setSearchResults([]);
    searchInputRef.current?.blur();
  };

  const showDropdown = searchFocused && (searchQuery.length >= 2);

  // Load real notifications
  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => {});
  }, []);

  // Refresh notifications when dropdown opens
  const handleNotificationsToggle = (open: boolean) => {
    setShowNotifications(open);
    if (open) {
      getNotifications().then(setNotifications).catch(() => {});
    }
  };

  // Get translated role name
  const getRoleName = (role: string): string => {
    const roleKey = role as keyof typeof t.roles;
    return t.roles[roleKey] || role;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6"
    >
      {/* Search */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ width: searchFocused ? 480 : 400 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t.common.search}
            className="h-10 pl-10 pr-20 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium">
              <Command className="w-3 h-3 inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium">K</kbd>
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
              >
                {searching ? (
                  <div className="p-4 text-center text-sm text-slate-400">{t.common.loading}</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto py-1">
                    {searchResults.map((result, index) => {
                      const Icon = typeIcons[result.type] || Search;
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onMouseDown={() => handleResultClick(result)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                            index === selectedIndex ? "bg-violet-50 dark:bg-violet-900/20" : ""
                          }`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${typeColors[result.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{result.title}</p>
                            <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                          </div>
                          <span className="text-[10px] uppercase font-medium text-slate-400 tracking-wider">{result.type}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">{t.common.noResults}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* AI Assistant button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 gap-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t.dashboard.aiInsights}</span>
          </Button>
        </motion.div>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={handleNotificationsToggle}>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl hover:bg-slate-100"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-0.5 -top-0.5"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-[10px] font-bold text-white shadow-lg shadow-violet-500/30">
                        {unreadCount}
                      </span>
                      <span className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-30" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-50">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{t.user.notifications}</h3>
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 h-8 px-2 text-xs">
                  {t.common.viewAll}
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  {t.user.noNotifications}
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                      notif.unread ? "bg-violet-50/50 dark:bg-violet-900/10" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                        notif.unread ? "bg-violet-500" : "bg-transparent"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{notif.title}</p>
                        <p className="text-sm text-slate-500 truncate">{notif.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg">
                {t.common.viewAll}
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="ghost" className="flex items-center gap-3 px-2 h-10 rounded-xl hover:bg-slate-100">
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-semibold">
                      {user ? getInitials(user.fullName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user?.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                </div>
                <div className="hidden flex-col items-start lg:flex">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {userLoading ? "..." : (user?.fullName || "Guest")}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {user ? getRoleName(user.role) : ""}
                  </span>
                </div>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-50">
            <DropdownMenuLabel className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold">
                    {user ? getInitials(user.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{user?.fullName || "Guest"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg mx-2 my-1">
              {t.user.profile}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg mx-2 my-1">
              {t.user.preferences}
            </DropdownMenuItem>
            <LanguageSelector />
            <DropdownMenuItem className="cursor-pointer rounded-lg mx-2 my-1">
              {t.user.help}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg mx-2 my-1"
            >
              {t.user.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
