"use client";

import { useState, useEffect } from "react";
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
import { getProperties, type Property } from "@/lib/queries/properties";
import { Plus, Search, LayoutGrid, List, Filter, Loader2 } from "lucide-react";

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
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (err) {
        setError("Failed to load properties");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

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
        <Loader2 className="h-8 w-8 animate-spin text-copper-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Properties</h1>
          <p className="text-muted-foreground">
            Manage your property inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border p-1">
            <Button variant="ghost" size="sm" className="bg-white shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" className="bg-copper-500 hover:bg-copper-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Properties</p>
          <p className="text-2xl font-bold">{filteredProperties.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{availableCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Dubai</p>
          <p className="text-2xl font-bold">{dubaiCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">USA</p>
          <p className="text-2xl font-bold">{usaCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
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
            <SelectValue placeholder="Market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="dubai">Dubai</SelectItem>
            <SelectItem value="usa">USA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="disponible">Available</SelectItem>
            <SelectItem value="reservado">Reserved</SelectItem>
            <SelectItem value="vendido">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={operationFilter} onValueChange={setOperationFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="off-plan">Off-Plan</SelectItem>
            <SelectItem value="resale">Resale</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      {transformedProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {transformedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-medium">No properties found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  );
}
