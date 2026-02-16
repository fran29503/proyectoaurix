"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Palette,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { useLanguage } from "@/lib/i18n";
import { useCurrentUser } from "@/lib/rbac";
import {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  deleteAvatar,
  type ProfileData,
} from "@/lib/queries/profile";
import { useTheme } from "@/components/providers/theme-provider";

type TabType = "personal" | "notifications" | "security" | "appearance";

export default function ProfilePage() {
  const { t, setLanguage, language } = useLanguage();
  const { user: currentUser } = useCurrentUser();
  const { theme: currentTheme, setTheme: applyTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsPush, setNotificationsPush] = useState(true);
  const [notificationsSla, setNotificationsSla] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">(currentTheme);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile();
      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setPhone(data.phone || "");
        setSelectedLanguage(data.language);
        setNotificationsEmail(data.notifications_email);
        setNotificationsPush(data.notifications_push);
        setNotificationsSla(data.notifications_sla);
        setTheme(data.theme);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const showMessage = (msg: string, isError: boolean = false) => {
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);
  };

  const handleSavePersonal = async () => {
    setSaving(true);
    const { success, error } = await updateProfile({
      full_name: fullName,
      phone: phone || null,
      language: selectedLanguage,
    });

    if (success) {
      setLanguage(selectedLanguage as "en" | "es" | "ar");
      showMessage(t.messages?.updateSuccess || "Profile updated successfully");
    } else {
      showMessage(error || t.messages?.updateError || "Failed to update profile", true);
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    const { success, error } = await updateProfile({
      notifications_email: notificationsEmail,
      notifications_push: notificationsPush,
      notifications_sla: notificationsSla,
    });

    if (success) {
      showMessage(t.messages?.updateSuccess || "Settings updated successfully");
    } else {
      showMessage(error || t.messages?.updateError || "Failed to update settings", true);
    }
    setSaving(false);
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    applyTheme(theme);
    showMessage(t.messages?.updateSuccess || "Appearance updated successfully");
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", true);
      return;
    }

    if (newPassword.length < 8) {
      showMessage("Password must be at least 8 characters", true);
      return;
    }

    setSaving(true);
    const { success, error } = await updatePassword(newPassword);

    if (success) {
      showMessage("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showMessage(error || "Failed to update password", true);
    }
    setSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file", true);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showMessage("Image must be less than 2MB", true);
      return;
    }

    setUploadingAvatar(true);
    const { url, error } = await uploadAvatar(file);

    if (url) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : null));
      showMessage("Avatar updated successfully");
    } else {
      showMessage(error || "Failed to upload avatar", true);
    }
    setUploadingAvatar(false);
  };

  const handleDeleteAvatar = async () => {
    setUploadingAvatar(true);
    const { success, error } = await deleteAvatar();

    if (success) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null));
      showMessage("Avatar removed");
    } else {
      showMessage(error || "Failed to remove avatar", true);
    }
    setUploadingAvatar(false);
  };

  const tabs = [
    { id: "personal" as const, label: t.profile?.personalInfo || "Personal Info", icon: User },
    { id: "notifications" as const, label: t.user?.notifications || "Notifications", icon: Bell },
    { id: "security" as const, label: t.profile?.security || "Security", icon: Lock },
    { id: "appearance" as const, label: t.profile?.appearance || "Appearance", icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-slate-500">{t.common?.loading}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">
                {t.user?.profile || "Profile Settings"}
              </h1>
            </div>
            <p className="text-slate-500 ml-8">
              {t.profile?.subtitle || "Manage your account settings and preferences"}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Success/Error Messages */}
      {(success || error) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-2 p-4 rounded-xl",
            success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          )}
        >
          {success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {success || error}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg sticky top-6">
            <CardContent className="p-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6 pt-2">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-semibold">
                      {profile ? getInitials(profile.full_name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{profile?.full_name}</h3>
                <p className="text-sm text-slate-500">{profile?.email}</p>
                {profile?.avatar_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t.profile?.removePhoto || "Remove photo"}
                  </Button>
                )}
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <FadeIn>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t.profile?.personalInfo || "Personal Information"}</CardTitle>
                  <CardDescription>
                    {t.profile?.personalInfoDesc || "Update your personal details"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t.form?.fullName || "Full Name"}</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.form?.email || "Email"}</Label>
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="rounded-xl bg-slate-50"
                      />
                      <p className="text-xs text-slate-500">
                        {t.profile?.emailCannotChange || "Email cannot be changed"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.form?.phone || "Phone"}</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.common?.language || "Language"}</Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="ar">🇦🇪 العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSavePersonal}
                      disabled={saving}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.common?.saving}
                        </>
                      ) : (
                        t.common?.saveChanges || "Save Changes"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <FadeIn>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t.user?.notifications || "Notifications"}</CardTitle>
                  <CardDescription>
                    {t.profile?.notificationsDesc || "Configure how you receive notifications"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {t.profile?.emailNotifications || "Email Notifications"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t.profile?.emailNotificationsDesc || "Receive updates via email"}
                        </p>
                      </div>
                      <Switch
                        checked={notificationsEmail}
                        onCheckedChange={setNotificationsEmail}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {t.profile?.pushNotifications || "Push Notifications"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t.profile?.pushNotificationsDesc || "Receive browser notifications"}
                        </p>
                      </div>
                      <Switch
                        checked={notificationsPush}
                        onCheckedChange={setNotificationsPush}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {t.profile?.slaAlerts || "SLA Alerts"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {t.profile?.slaAlertsDesc || "Get notified when leads exceed SLA"}
                        </p>
                      </div>
                      <Switch
                        checked={notificationsSla}
                        onCheckedChange={setNotificationsSla}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.common?.saving}
                        </>
                      ) : (
                        t.common?.saveChanges || "Save Changes"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <FadeIn>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t.profile?.security || "Security"}</CardTitle>
                  <CardDescription>
                    {t.profile?.securityDesc || "Manage your password and security settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        {t.profile?.newPassword || "New Password"}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        {t.profile?.confirmPassword || "Confirm Password"}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-xl"
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      {t.profile?.passwordRequirements || "Password must be at least 8 characters"}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleChangePassword}
                      disabled={saving || !newPassword || !confirmPassword}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.common?.saving}
                        </>
                      ) : (
                        t.profile?.updatePassword || "Update Password"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <FadeIn>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{t.profile?.appearance || "Appearance"}</CardTitle>
                  <CardDescription>
                    {t.profile?.appearanceDesc || "Customize how the app looks"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>{t.profile?.theme || "Theme"}</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: t.profile?.lightTheme || "Light", icon: "☀️" },
                        { value: "dark", label: t.profile?.darkTheme || "Dark", icon: "🌙" },
                        { value: "system", label: t.profile?.systemTheme || "System", icon: "💻" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value as typeof theme)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-center transition-all",
                            theme === option.value
                              ? "border-violet-500 bg-violet-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <p className="font-medium text-slate-900">{option.label}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">
                      {t.profile?.themeNote || "Theme will be applied immediately on save"}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleSaveAppearance}
                      disabled={saving}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.common?.saving}
                        </>
                      ) : (
                        t.common?.saveChanges || "Save Changes"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
