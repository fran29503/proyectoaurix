// Mock properties data based on MHR seed data
export interface PropertyData {
  id: string;
  code: string;
  market: "dubai" | "usa";
  title: string;
  type: string;
  zone: string;
  price: number;
  currency: string;
  operation: "off-plan" | "resale" | "rent";
  status: "disponible" | "reservado" | "vendido";
  developer: string | null;
  description: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  features: string[];
  images: string[];
  tags: string[];
  createdAt: string;
}

export const propertiesData: PropertyData[] = [
  {
    id: "33333333-0001-0001-0001-000000000001",
    code: "AE-DCH-CH-1BR-1407",
    market: "dubai",
    title: "Creekside Horizon 1BR - Unit 1407",
    type: "1BR",
    zone: "Creek Harbour",
    price: 1650000,
    currency: "AED",
    operation: "off-plan",
    status: "disponible",
    developer: "Emaar",
    description: "Stunning 1BR apartment with panoramic creek views. Part of the prestigious Creekside Horizon development by Emaar. Features smart home technology, premium finishes, and access to world-class amenities including infinity pool, gym, and concierge services.",
    bedrooms: "1",
    bathrooms: "2",
    area: "850 sqft",
    features: ["Creek View", "Smart Home", "Gym", "Pool", "Concierge"],
    images: ["/api/placeholder/800/600"],
    tags: ["payment_plan_80_20", "view", "amenities", "investor_ready"],
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: "33333333-0001-0001-0001-000000000002",
    code: "AE-DTWN-BB-2BR-2211",
    market: "dubai",
    title: "Downtown Boulevard 2BR - Unit 2211",
    type: "2BR",
    zone: "Downtown",
    price: 3950000,
    currency: "AED",
    operation: "resale",
    status: "disponible",
    developer: null,
    description: "Premium 2BR apartment with direct Burj Khalifa views. High floor unit featuring designer finishes, fully furnished with Italian furniture. Walking distance to Dubai Mall and DIFC.",
    bedrooms: "2",
    bathrooms: "3",
    area: "1,450 sqft",
    features: ["Burj View", "High Floor", "Furnished", "Balcony", "Parking x2"],
    images: ["/api/placeholder/800/600"],
    tags: ["burj_view", "high_floor", "premium", "furnished"],
    createdAt: new Date(Date.now() - 1728000000).toISOString(),
  },
  {
    id: "33333333-0001-0001-0001-000000000003",
    code: "AE-DM-PR-3BR-0903",
    market: "dubai",
    title: "Marina Pinnacle 3BR - Unit 903",
    type: "3BR",
    zone: "Dubai Marina",
    price: 4600000,
    currency: "AED",
    operation: "resale",
    status: "reservado",
    developer: null,
    description: "Exclusive 3BR penthouse with full marina views. Premium location walking distance to beach and JBR. Features private terrace, premium finishes, and maid's room.",
    bedrooms: "3",
    bathrooms: "4",
    area: "2,200 sqft",
    features: ["Marina View", "Penthouse", "Private Terrace", "Premium Finishes", "Maid Room"],
    images: ["/api/placeholder/800/600"],
    tags: ["marina_view", "furnished", "investor_ready", "premium"],
    createdAt: new Date(Date.now() - 5184000000).toISOString(),
  },
  {
    id: "33333333-0001-0001-0001-000000000004",
    code: "AE-DBL-DL-VILLA-07",
    market: "dubai",
    title: "Damac Lagoons Villa - Plot 07",
    type: "Villa",
    zone: "Dubailand",
    price: 2250000,
    currency: "AED",
    operation: "off-plan",
    status: "disponible",
    developer: "DAMAC",
    description: "Family villa in the new Damac Lagoons community. Mediterranean-inspired design with private pool, garden, and modern smart home features. Part of a gated community with beach access.",
    bedrooms: "4",
    bathrooms: "5",
    area: "3,500 sqft",
    features: ["Private Pool", "Garden", "Maid Room", "Smart Home", "Community Beach"],
    images: ["/api/placeholder/800/600"],
    tags: ["family", "community", "installments", "new_launch"],
    createdAt: new Date(Date.now() - 864000000).toISOString(),
  },
  {
    id: "33333333-0001-0001-0001-000000000005",
    code: "US-FL-MIA-BR-2B-12A",
    market: "usa",
    title: "Brickell Bay Tower 2/2 - Unit 12A",
    type: "Condo 2/2",
    zone: "Miami (Brickell)",
    price: 785000,
    currency: "USD",
    operation: "resale",
    status: "disponible",
    developer: null,
    description: "Modern 2BR/2BA condo in prime Brickell location. Bay views, walking distance to Brickell City Centre. Building features resort-style amenities, 24/7 concierge, and valet parking.",
    bedrooms: "2",
    bathrooms: "2",
    area: "1,150 sqft",
    features: ["Bay View", "Gym", "Pool", "Concierge", "Parking"],
    images: ["/api/placeholder/800/600"],
    tags: ["rental_demand", "walkable", "bay_view", "investment"],
    createdAt: new Date(Date.now() - 1296000000).toISOString(),
  },
  {
    id: "33333333-0001-0001-0001-000000000006",
    code: "US-FL-MIA-EW-1B-08C",
    market: "usa",
    title: "Edgewater Skyline 1/1 - Unit 08C",
    type: "Condo 1/1",
    zone: "Miami (Edgewater)",
    price: 510000,
    currency: "USD",
    operation: "resale",
    status: "disponible",
    developer: null,
    description: "Bright 1BR/1BA in up-and-coming Edgewater neighborhood. Great rental yields with modern amenities. Features open floor plan, modern kitchen, and city views.",
    bedrooms: "1",
    bathrooms: "1",
    area: "780 sqft",
    features: ["City View", "Modern Kitchen", "Gym", "Rooftop Pool"],
    images: ["/api/placeholder/800/600"],
    tags: ["cashflow", "modern", "amenities", "starter_investment"],
    createdAt: new Date(Date.now() - 2160000000).toISOString(),
  },
  {
    id: "33333333-0001-0001-0001-000000000007",
    code: "US-TX-AUS-SFH-04",
    market: "usa",
    title: "Austin Tech Corridor Home",
    type: "Single Family",
    zone: "Austin",
    price: 925000,
    currency: "USD",
    operation: "resale",
    status: "disponible",
    developer: null,
    description: "Spacious 4BR single family home in Austin's booming tech corridor. Great schools district, modern updates, and large backyard. Perfect for families or as rental investment.",
    bedrooms: "4",
    bathrooms: "3",
    area: "2,800 sqft",
    features: ["Backyard", "Garage x2", "Updated Kitchen", "Near Schools"],
    images: ["/api/placeholder/800/600"],
    tags: ["tech_area", "schools", "yard", "family"],
    createdAt: new Date(Date.now() - 3024000000).toISOString(),
  },
];

// Helper functions
export function formatPropertyPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getPropertiesByMarket(market: "dubai" | "usa"): PropertyData[] {
  return propertiesData.filter((p) => p.market === market);
}

export function getPropertiesByStatus(status: PropertyData["status"]): PropertyData[] {
  return propertiesData.filter((p) => p.status === status);
}

export function getPropertyById(id: string): PropertyData | undefined {
  return propertiesData.find((p) => p.id === id);
}
