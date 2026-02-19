"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Bell, Palette, Shield, Globe, History } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { useLanguage } from "@/lib/i18n";
import { Can, AdminOnly, ManagerOrAbove } from "@/lib/rbac";

interface SettingsCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  index: number;
}

function SettingsCard({ title, description, href, icon, index }: SettingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={href}>
        <HoverLift>
          <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverLift>
      </Link>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { t } = useLanguage();

  const settingsItems = [
    {
      title: t.settings?.userManagement || "User Management",
      description: t.settings?.userManagementDesc || "Manage team members and their permissions",
      href: "/dashboard/settings/users",
      icon: <Users className="h-6 w-6" />,
      permission: { resource: "team" as const, action: "manage" as const },
    },
    {
      title: t.user?.profile || "Profile Settings",
      description: "Update your personal information and preferences",
      href: "/dashboard/settings/profile",
      icon: <Shield className="h-6 w-6" />,
      permission: null,
    },
    {
      title: t.user?.notifications || "Notifications",
      description: "Configure notification preferences",
      href: "/dashboard/settings/notifications",
      icon: <Bell className="h-6 w-6" />,
      permission: null,
    },
  ];

  // Admin-only settings
  const adminSettings = [
    {
      title: t.audit?.title || "Audit Log",
      description: t.audit?.subtitle || "Track all user actions and system changes",
      href: "/dashboard/settings/audit",
      icon: <History className="h-6 w-6" />,
    },
    {
      title: "Branding",
      description: "Customize your organization's appearance",
      href: "/dashboard/settings/branding",
      icon: <Palette className="h-6 w-6" />,
    },
    {
      title: "Integrations",
      description: "Connect external services and APIs",
      href: "/dashboard/settings/integrations",
      icon: <Globe className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.settings?.title || "Settings"}</h1>
          <p className="text-slate-500 mt-1">
            Manage your account and organization settings
          </p>
        </div>
      </FadeIn>

      {/* General Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">General</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingsItems.map((item, index) => {
            if (item.permission) {
              return (
                <Can key={item.href} resource={item.permission.resource} action={item.permission.action}>
                  <SettingsCard
                    title={item.title}
                    description={item.description}
                    href={item.href}
                    icon={item.icon}
                    index={index}
                  />
                </Can>
              );
            }
            return (
              <SettingsCard
                key={item.href}
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
                index={index}
              />
            );
          })}
        </div>
      </div>

      {/* Admin Settings */}
      <AdminOnly>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Administration</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminSettings.map((item, index) => (
              <SettingsCard
                key={item.href}
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
                index={settingsItems.length + index}
              />
            ))}
          </div>
        </div>
      </AdminOnly>
    </div>
  );
}
