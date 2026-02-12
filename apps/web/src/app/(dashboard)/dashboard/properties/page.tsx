"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyModal } from "@/components/properties/property-modal";
import { DeletePropertyDialog } from "@/components/properties/delete-property-dialog";
import { getProperties, type Property } from "@/lib/queries/properties";
import { Plus, Search, LayoutGrid, List, Filter, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { useLanguage } from "@/lib/i18n";
import { Can, useCurrentUser } from "@/lib/rbac";

// Transform Supabase data to match the card format (PropertyData type)
function transformPropertyData(property: Property) {
  return {
    id: property.id,
    code: property.code,
    market: property.market as "dubai" | "usa",
    title: property.title,
    type: property.type,
    zone: property.zone,
    price: property.price,
    currency: property.currency,
    operation: property.operation as "off-plan" | "resale" | "rent",
    status: property.status as "disponible" | "reservado" | "vendido",
    developer: property.developer || null,
    description: property.description || "",
    bedrooms: String(property.bedrooms || 0),
    bathrooms: String(property.bathrooms || 0),
    area: property.area || "",
    features: property.features || [],
    images: property.images || [],
    tags: property.tags || [],
    createdAt: property.created_at,
  };
}

export default function PropertiesPage() {
  const { t } = useLanguage();
  const { can } = useCurrentUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<{ id: string; title: string } | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (err) {
      setError("loadPropertiesError");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowPropertyModal(true);
  };

  const handleEditProperty = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      setEditingProperty(property);
      setShowPropertyModal(true);
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      setDeletingProperty({ id: property.id, title: property.title });
    }
  };

  // Get unique types
  const propertyTypes = Array.from(new Set(properties.map((p) => p.type)));

  // Filter properties (client-side filtering for search and combined filters)
  const filteredProperties = properties.filter((property) => {
    if (search && !property.title.toLowerCase().includes(search.toLowerCase()) &&
        !property.zone.toLowerCase().includes(search.toLowerCase()) &&
        !property.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (marketFilter !== "all" && property.market !== marketFilter) return false;
    if (statusFilter !== "all" && property.status !== statusFilter) return false;
    if (operationFilter !== "all" && property.operation !== operationFilter) return false;
    if (typeFilter !== "all" && property.type !== typeFilter) return false;
    return true;
  });

  const transformedProperties = filteredProperties.map(transformPropertyData);

  // Stats
  const availableCount = filteredProperties.filter((p) => p.status === "disponible").length;
  const dubaiCount = filteredProperties.filter((p) => p.market === "dubai").length;
  const usaCount = filteredProperties.filter((p) => p.market === "usa").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-slate-500">{t.properties.loadingProperties}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    const errorKey = error as keyof typeof t.messages;
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-red-600">{t.messages[errorKey] || error}</p>
        <Button onClick={() => window.location.reload()}>{t.properties.retry}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.properties.title}</h1>
            <p className="text-slate-500 mt-1">
              {t.properties.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {t.common.refresh}
              </Button>
            </motion.div>
            <div className="flex items-center rounded-xl border p-1 bg-white">
              <Button variant="ghost" size="sm" className="bg-violet-50 text-violet-700 rounded-lg">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Can resource="properties" action="create">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  onClick={handleAddProperty}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.properties.addProperty}
                </Button>
              </motion.div>
            </Can>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t.properties.totalProperties, value: filteredProperties.length, color: "slate" },
          { label: t.properties.available, value: availableCount, color: "emerald" },
          { label: t.market.dubai, value: dubaiCount, color: "violet" },
          { label: t.market.usa, value: usaCount, color: "blue" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <HoverLift>
              <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </p>
              </div>
            </HoverLift>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.properties.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t.leads.market} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.properties.allMarkets}</SelectItem>
            <SelectItem value="dubai">{t.market.dubai}</SelectItem>
            <SelectItem value="usa">{t.market.usa}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t.properties.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.properties.allStatus}</SelectItem>
            <SelectItem value="disponible">{t.properties.available}</SelectItem>
            <SelectItem value="reservado">{t.properties.reserved}</SelectItem>
            <SelectItem value="vendido">{t.properties.sold}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t.properties.operation} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.properties.allTypes}</SelectItem>
            <SelectItem value="off-plan">{t.properties.offPlan}</SelectItem>
            <SelectItem value="resale">{t.properties.resale}</SelectItem>
            <SelectItem value="rent">{t.properties.rent}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t.properties.propertyType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.properties.allTypes}</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {transformedProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transformedProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PropertyCard
                  property={property}
                  onEdit={can("properties", "edit") ? handleEditProperty : undefined}
                  onDelete={can("properties", "delete") ? handleDeleteProperty : undefined}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium">{t.properties.noProperties}</h3>
            <p className="text-sm text-muted-foreground">
              {t.properties.tryAdjustingFilters}
            </p>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <PropertyModal
        open={showPropertyModal}
        onOpenChange={setShowPropertyModal}
        property={editingProperty}
        onSuccess={fetchProperties}
      />

      <DeletePropertyDialog
        open={!!deletingProperty}
        onOpenChange={(open) => !open && setDeletingProperty(null)}
        property={deletingProperty}
        onSuccess={fetchProperties}
      />
    </div>
  );
}
