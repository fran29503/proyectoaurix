import { createClient } from "@/lib/supabase/client";

export interface Property {
  id: string;
  tenant_id: string;
  code: string;
  title: string;
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
  features: string[];
  tags: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  status?: string;
  market?: string;
  operation?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  search?: string;
}

export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  const supabase = createClient();

  let query = supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.market && filters.market !== "all") {
    query = query.eq("market", filters.market);
  }

  if (filters?.operation && filters.operation !== "all") {
    query = query.eq("operation", filters.operation);
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters?.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters?.bedrooms) {
    query = query.eq("bedrooms", filters.bedrooms);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,zone.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching properties:", error);
    return [];
  }

  return data || [];
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  return data;
}

export async function getPropertiesStats() {
  const supabase = createClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("status, market, price, operation");

  if (error) {
    console.error("Error fetching properties stats:", error);
    return null;
  }

  const total = properties?.length || 0;
  const byStatus: Record<string, number> = {};
  const byMarket: Record<string, number> = {};

  let totalValue = 0;

  properties?.forEach((property) => {
    byStatus[property.status] = (byStatus[property.status] || 0) + 1;
    byMarket[property.market] = (byMarket[property.market] || 0) + 1;
    totalValue += property.price || 0;
  });

  return {
    total,
    byStatus,
    byMarket,
    available: byStatus["disponible"] || 0,
    avgPrice: total > 0 ? Math.round(totalValue / total) : 0,
  };
}

export function formatPropertyPrice(price: number, currency: string): string {
  if (currency === "AED") {
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${price.toLocaleString()}`;
  }
  if (currency === "USD") {
    if (price >= 1000000) {
      return `USD ${(price / 1000000).toFixed(1)}M`;
    }
    return `USD ${price.toLocaleString()}`;
  }
  return `${currency} ${price.toLocaleString()}`;
}
