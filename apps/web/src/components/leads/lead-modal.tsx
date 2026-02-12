"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, User, Phone, Mail, Globe, DollarSign, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    country_residence: string | null;
    language: string | null;
    channel: string | null;
    campaign: string | null;
    market: string | null;
    interest_zone: string | null;
    interest_type: string | null;
    budget_min: number | null;
    budget_max: number | null;
    budget_currency: string;
    timing: string | null;
    intent: string | null;
    status: string;
  } | null;
  onSuccess?: () => void;
}

const channels = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "portal", label: "Portal" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "direct", label: "Direct" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "organic_tiktok", label: "TikTok" },
  { value: "google_ads", label: "Google Ads" },
];

const markets = [
  { value: "dubai", label: "Dubai" },
  { value: "usa", label: "USA" },
];

const interestTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "penthouse", label: "Penthouse" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const timelines = [
  { value: "immediate", label: "Immediate" },
  { value: "1-3_months", label: "1-3 Months" },
  { value: "3-6_months", label: "3-6 Months" },
  { value: "6-12_months", label: "6-12 Months" },
  { value: "exploring", label: "Just Exploring" },
];

const intents = [
  { value: "alta", label: "High" },
  { value: "media", label: "Medium" },
  { value: "baja", label: "Low" },
];

const currencies = [
  { value: "AED", label: "AED" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export function LeadModal({ open, onOpenChange, lead, onSuccess }: LeadModalProps) {
  const { t } = useLanguage();
  const isEditing = !!lead;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: lead?.full_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    nationality: lead?.country_residence || "",
    language: lead?.language || "en",
    source_channel: lead?.channel || "direct",
    source_campaign: lead?.campaign || "",
    market: lead?.market || "dubai",
    interest_zone: lead?.interest_zone || "",
    interest_type: lead?.interest_type || "",
    budget_min: lead?.budget_min?.toString() || "",
    budget_max: lead?.budget_max?.toString() || "",
    budget_currency: lead?.budget_currency || "AED",
    timeline: lead?.timing || "",
    intent: lead?.intent || "media",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Determine segment based on market
      const segment = formData.market === "dubai" ? "dubai_offplan" : "usa_buyers";

      const payload = {
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        country_residence: formData.nationality || null,
        language: formData.language,
        channel: formData.source_channel,
        campaign: formData.source_campaign || null,
        market: formData.market,
        segment,
        interest_zone: formData.interest_zone || null,
        interest_type: formData.interest_type || null,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        budget_currency: formData.budget_currency,
        timing: formData.timeline || null,
        intent: formData.intent,
      };

      if (isEditing && lead) {
        const { error } = await supabase
          .from("leads")
          .update(payload)
          .eq("id", lead.id);

        if (error) throw error;
      } else {
        // Get tenant_id for new leads
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .limit(1)
          .single();

        if (tenantError) {
          console.error("Error fetching tenant:", tenantError.message, tenantError.details, tenantError.hint);
          throw new Error(`Could not determine tenant: ${tenantError.message}`);
        }

        if (!tenant?.id) {
          console.error("No tenant found in database");
          throw new Error("No tenant found. Please contact support.");
        }

        console.log("Creating lead with tenant_id:", tenant.id);

        const { error } = await supabase
          .from("leads")
          .insert([{ ...payload, status: "nuevo", tenant_id: tenant.id }]);

        if (error) {
          console.error("Supabase insert error:", error.message, error.details, error.hint, error.code);
          throw error;
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      // Handle Supabase PostgrestError or regular Error
      const supabaseError = err as { message?: string; details?: string; hint?: string; code?: string };
      if (supabaseError?.message) {
        console.error("Error saving lead:", supabaseError.message, supabaseError.details, supabaseError.hint);
        setError(supabaseError.message);
      } else if (err instanceof Error) {
        console.error("Error saving lead:", err.message);
        setError(err.message);
      } else {
        console.error("Error saving lead (unknown):", JSON.stringify(err));
        setError("Failed to save lead");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {isEditing ? t.leads.editLead : t.leads.newLead}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.form.fullName}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="full_name">{t.form.fullName} {t.form.required}</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="email">{t.form.email}</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="phone">{t.form.phone}</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="nationality">{t.form.nationality}</Label>
                <div className="relative mt-1.5">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => updateField("nationality", e.target.value)}
                    className="pl-10"
                    placeholder="e.g., UAE, UK, India"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Source Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              {t.form.channel} & {t.form.market}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.form.channel}</Label>
                <Select value={formData.source_channel} onValueChange={(v) => updateField("source_channel", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {channels.map((ch) => (
                      <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.form.market}</Label>
                <Select value={formData.market} onValueChange={(v) => updateField("market", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {markets.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="source_campaign">{t.form.campaign}</Label>
                <Input
                  id="source_campaign"
                  value={formData.source_campaign}
                  onChange={(e) => updateField("source_campaign", e.target.value)}
                  className="mt-1.5"
                  placeholder="e.g., Instagram Ad - Marina Views"
                />
              </div>
            </div>
          </div>

          {/* Interest Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t.form.propertyType}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.form.propertyType}</Label>
                <Select value={formData.interest_type} onValueChange={(v) => updateField("interest_type", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t.form.type} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {interestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="interest_zone">{t.form.preferredArea}</Label>
                <Input
                  id="interest_zone"
                  value={formData.interest_zone}
                  onChange={(e) => updateField("interest_zone", e.target.value)}
                  className="mt-1.5"
                  placeholder="e.g., Dubai Marina, JBR"
                />
              </div>
            </div>
          </div>

          {/* Budget Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t.leads.budget} & {t.form.timeline}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget_min">{t.form.minBudget}</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => updateField("budget_min", e.target.value)}
                  className="mt-1.5"
                  placeholder="500,000"
                />
              </div>
              <div>
                <Label htmlFor="budget_max">{t.form.maxBudget}</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => updateField("budget_max", e.target.value)}
                  className="mt-1.5"
                  placeholder="1,500,000"
                />
              </div>
              <div>
                <Label>{t.form.currency}</Label>
                <Select value={formData.budget_currency} onValueChange={(v) => updateField("budget_currency", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.form.timeline}</Label>
                <Select value={formData.timeline} onValueChange={(v) => updateField("timeline", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t.form.selectTimeline} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {timelines.map((timeline) => (
                      <SelectItem key={timeline.value} value={timeline.value}>{timeline.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.form.intentLevel}</Label>
                <Select value={formData.intent} onValueChange={(v) => updateField("intent", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {intents.map((i) => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            {t.common.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.full_name}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditing ? (
              t.common.saveChanges
            ) : (
              t.common.create
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
