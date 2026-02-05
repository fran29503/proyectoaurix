import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Edit,
  FileText,
  Share2,
  Users,
  DollarSign,
  Tag,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { propertiesData, formatPropertyPrice } from "@/lib/data/properties";
import { leadsData } from "@/lib/data/leads";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  disponible: { bg: "bg-emerald-100", text: "text-emerald-700" },
  reservado: { bg: "bg-amber-100", text: "text-amber-700" },
  vendido: { bg: "bg-slate-100", text: "text-slate-600" },
};

const operationLabels: Record<string, string> = {
  "off-plan": "Off-Plan",
  resale: "Resale",
  rent: "Rent",
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = propertiesData.find((p) => p.id === id);

  if (!property) {
    notFound();
  }

  const statusStyle = statusColors[property.status];

  // Get interested leads (mock - in real app would query by property)
  const interestedLeads = leadsData
    .filter((l) => l.interestZone === property.zone)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-navy-950">{property.title}</h1>
              <Badge className={cn("font-normal", statusStyle.bg, statusStyle.text)}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-lg">{property.market === "dubai" ? "🇦🇪" : "🇺🇸"}</span>
              <span>{property.code}</span>
              <span>•</span>
              <MapPin className="h-4 w-4" />
              <span>{property.zone}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery Placeholder */}
          <Card>
            <CardContent className="p-0">
              <div className="relative h-80 bg-slate-200 rounded-t-lg flex items-center justify-center">
                <Building2 className="h-24 w-24 text-slate-400" />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90">
                    1 / 1 photos
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{property.description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interested Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Interested Leads</CardTitle>
              <Badge variant="secondary">{interestedLeads.length}</Badge>
            </CardHeader>
            <CardContent>
              {interestedLeads.length > 0 ? (
                <div className="space-y-3">
                  {interestedLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/dashboard/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-navy-950 text-white text-xs">
                            {getInitials(lead.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{lead.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.budgetCurrency} {lead.budgetMin?.toLocaleString()} - {lead.budgetMax?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lead.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No interested leads yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="border-copper-200 bg-copper-50/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-3xl font-bold text-navy-950">
                {formatPropertyPrice(property.price, property.currency)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {operationLabels[property.operation]}
                </Badge>
                {property.operation === "off-plan" && (
                  <Badge variant="outline" className="text-xs">
                    Payment Plan Available
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Bed className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Bath className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Maximize className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-medium">{property.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Building2 className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{property.type}</p>
                </div>
              </div>
              {property.developer && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Tag className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <p className="font-medium">{property.developer}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-medium">{property.zone}</p>
              <p className="text-sm text-muted-foreground">
                {property.market === "dubai" ? "Dubai, UAE" : "United States"}
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          {property.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button className="w-full bg-copper-500 hover:bg-copper-600">
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF Brochure
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share with Lead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
