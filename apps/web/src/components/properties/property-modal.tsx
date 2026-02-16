"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/lib/queries/audit";
import { Loader2, Building2, MapPin, DollarSign, Home } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface PropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: {
    id: string;
    title: string;
    code: string;
    description: string | null;
    type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: string | null;
    price: number;
    currency: string;
    status: string;
    operation: string;
    market: string;
    zone: string;
    developer: string | null;
  } | null;
  onSuccess?: () => void;
}

const propertyTypes = [
  { value: "Studio", label: "Studio" },
  { value: "1BR", label: "1 Bedroom" },
  { value: "2BR", label: "2 Bedrooms" },
  { value: "3BR", label: "3 Bedrooms" },
  { value: "4BR", label: "4 Bedrooms" },
  { value: "5BR+", label: "5+ Bedrooms" },
  { value: "Villa", label: "Villa" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Penthouse", label: "Penthouse" },
  { value: "Condo", label: "Condo" },
  { value: "Commercial", label: "Commercial" },
  { value: "Land", label: "Land" },
];

const operations = [
  { value: "off-plan", label: "Off-Plan" },
  { value: "resale", label: "Resale" },
  { value: "rent", label: "Rent" },
];

const markets = [
  { value: "dubai", label: "Dubai" },
  { value: "usa", label: "USA" },
];

const statuses = [
  { value: "disponible", label: "Available" },
  { value: "reservado", label: "Reserved" },
  { value: "vendido", label: "Sold" },
];

const currencies = [
  { value: "AED", label: "AED" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

const dubaiZones = [
  "Downtown", "Dubai Marina", "Palm Jumeirah", "JBR", "Business Bay",
  "Creek Harbour", "Dubai Hills", "Dubailand", "JVC", "JLT",
  "DIFC", "City Walk", "Meydan", "Emirates Hills", "Arabian Ranches",
];

const usaZones = [
  "Miami (Brickell)", "Miami (Edgewater)", "Miami (Downtown)", "Miami Beach",
  "Fort Lauderdale", "Austin", "Dallas", "Houston", "New York", "Los Angeles",
];

export function PropertyModal({ open, onOpenChange, property, onSuccess }: PropertyModalProps) {
  const { t } = useLanguage();
  const isEditing = !!property;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    type: "1BR",
    bedrooms: "",
    bathrooms: "",
    area: "",
    price: "",
    currency: "AED",
    status: "disponible",
    operation: "off-plan",
    market: "dubai",
    zone: "",
    developer: "",
  });

  // Reset form when property changes
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        code: property.code,
        description: property.description || "",
        type: property.type,
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area: property.area || "",
        price: property.price.toString(),
        currency: property.currency,
        status: property.status,
        operation: property.operation,
        market: property.market,
        zone: property.zone,
        developer: property.developer || "",
      });
    } else {
      setFormData({
        title: "",
        code: "",
        description: "",
        type: "1BR",
        bedrooms: "",
        bathrooms: "",
        area: "",
        price: "",
        currency: "AED",
        status: "disponible",
        operation: "off-plan",
        market: "dubai",
        zone: "",
        developer: "",
      });
    }
  }, [property, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const payload = {
        title: formData.title,
        code: formData.code,
        description: formData.description || null,
        type: formData.type,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area: formData.area || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        status: formData.status,
        operation: formData.operation,
        market: formData.market,
        zone: formData.zone,
        developer: formData.developer || null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && property) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", property.id);
        if (error) throw error;

        logAuditAction({
          action: "update",
          resource: "property",
          resourceId: property.id,
          resourceName: payload.title,
          oldValues: { title: property.title, price: property.price, status: property.status },
          newValues: payload,
        }).catch(() => {});
      } else {
        // Get tenant_id (for now use the default one)
        const { data: tenant } = await supabase
          .from("tenants")
          .select("id")
          .limit(1)
          .single();

        const { data: newProperty, error } = await supabase
          .from("properties")
          .insert([{ ...payload, tenant_id: tenant?.id }])
          .select("id")
          .single();
        if (error) throw error;

        logAuditAction({
          action: "create",
          resource: "property",
          resourceId: newProperty?.id,
          resourceName: payload.title,
          newValues: payload,
        }).catch(() => {});
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving property:", err);
      setError(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const zones = formData.market === "dubai" ? dubaiZones : usaZones;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-white rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-600" />
            {isEditing ? t.properties.editProperty : t.properties.newProperty}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Home className="w-4 h-4" />
              {t.properties.title}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">{t.form.title} {t.form.required}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">{t.form.code} {t.form.required}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label>{t.form.type}</Label>
                <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bedrooms">{t.form.bedrooms}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => updateField("bedrooms", e.target.value)}
                  className="mt-1.5"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">{t.form.bathrooms}</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => updateField("bathrooms", e.target.value)}
                  className="mt-1.5"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="area">{t.form.area}</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => updateField("area", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="developer">{t.form.developer}</Label>
                <Input
                  id="developer"
                  value={formData.developer}
                  onChange={(e) => updateField("developer", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t.properties.location} & {t.form.market}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.form.market}</Label>
                <Select value={formData.market} onValueChange={(v) => {
                  updateField("market", v);
                  updateField("zone", "");
                  updateField("currency", v === "dubai" ? "AED" : "USD");
                }}>
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
              <div>
                <Label>{t.form.zone}</Label>
                <Select value={formData.zone} onValueChange={(v) => updateField("zone", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={t.form.selectZone} />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {zones.map((z) => (
                      <SelectItem key={z} value={z}>{z}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.form.operation}</Label>
                <Select value={formData.operation} onValueChange={(v) => updateField("operation", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="off-plan">{t.properties.offPlan}</SelectItem>
                    <SelectItem value="resale">{t.properties.resale}</SelectItem>
                    <SelectItem value="rent">{t.properties.rent}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.form.status}</Label>
                <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="disponible">{t.properties.available}</SelectItem>
                    <SelectItem value="reservado">{t.properties.reserved}</SelectItem>
                    <SelectItem value="vendido">{t.properties.sold}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t.form.price}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">{t.form.price} {t.form.required}</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label>{t.form.currency}</Label>
                <Select value={formData.currency} onValueChange={(v) => updateField("currency", v)}>
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
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.form.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-[80px]"
            />
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
            disabled={loading || !formData.title || !formData.code || !formData.price}
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
