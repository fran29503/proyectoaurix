"use client";

import { Bell, Search, Command, Sparkles } from "lucide-react";
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
import { useState } from "react";

interface HeaderProps {
  user?: {
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const { signOut } = useSignOut();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Demo user for MVP
  const currentUser = user || {
    fullName: "Omar Al-Mansouri",
    email: "omar@meridianharbor.ae",
    role: "admin",
    avatarUrl: null,
  };

  const notifications = [
    { id: 1, title: "New lead assigned", desc: "Ahmed Sharif - Dubai Marina", time: "2m ago", unread: true },
    { id: 2, title: "Meeting reminder", desc: "Call with Elena Kozlova", time: "1h ago", unread: true },
    { id: 3, title: "Deal closed!", desc: "Downtown 2BR - AED 3.8M", time: "3h ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl px-6"
    >
      {/* Search */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ width: searchFocused ? 480 : 400 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search leads, properties, tasks..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-10 pl-10 pr-20 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">
              <Command className="w-3 h-3 inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium">K</kbd>
          </div>
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
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>
        </motion.div>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl hover:bg-slate-100"
              >
                <Bell className="h-5 w-5 text-slate-600" />
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
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-200">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 h-8 px-2 text-xs">
                  Mark all read
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                    notif.unread ? "bg-violet-50/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      notif.unread ? "bg-violet-500" : "bg-transparent"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                      <p className="text-sm text-slate-500 truncate">{notif.desc}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 mx-2" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="ghost" className="flex items-center gap-3 px-2 h-10 rounded-xl hover:bg-slate-100">
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={currentUser.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-semibold">
                      {getInitials(currentUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="hidden flex-col items-start lg:flex">
                  <span className="text-sm font-medium text-slate-900">{currentUser.fullName}</span>
                  <span className="text-xs text-slate-500 capitalize">
                    {currentUser.role}
                  </span>
                </div>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200">
            <DropdownMenuLabel className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold">
                    {getInitials(currentUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{currentUser.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg mx-2 my-1">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg mx-2 my-1">
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg mx-2 my-1">
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg mx-2 my-1"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
