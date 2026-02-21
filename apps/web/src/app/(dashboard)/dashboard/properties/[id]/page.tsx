"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Edit,
  FileText,
  Share2,
  Users,
  DollarSign,
  Tag,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import {
  getPropertyById,
  getInterestedLeads,
  formatPropertyPrice,
  type Property,
  type InterestedLead,
} from "@/lib/queries/properties";
import { PropertyModal } from "@/components/properties/property-modal";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";

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

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [property, setProperty] = useState<Property | null>(null);
  const [interestedLeads, setInterestedLeads] = useState<InterestedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const prop = await getPropertyById(id);
    if (!prop) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProperty(prop);

    const leads = await getInterestedLeads(prop.zone, prop.market);
    setInterestedLeads(leads);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-3 text-sm text-muted-foreground">{t.common.loading}</span>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-700">{t.common.noResults}</p>
        <Link href="/dashboard/properties" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Button>
        </Link>
      </div>
    );
  }

  const statusStyle = statusColors[property.status] || { bg: "bg-slate-100", text: "text-slate-600" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
              <span className="text-lg">{property.market === "dubai" ? "\u{1F1E6}\u{1F1EA}" : "\u{1F1FA}\u{1F1F8}"}</span>
              <span>{property.code}</span>
              <span>&bull;</span>
              <MapPin className="h-4 w-4" />
              <span>{property.zone}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t.common.share}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" />
            {t.common.pdf}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t.common.edit}
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
                    {property.images?.length || 0} photos
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.properties.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.properties.features}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interested Leads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t.properties.interestedLeads}</CardTitle>
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
                            {getInitials(lead.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{lead.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.budget_currency} {lead.budget_min?.toLocaleString()} - {lead.budget_max?.toLocaleString()}
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
                  <p className="text-sm text-muted-foreground">{t.properties.noInterestedLeads}</p>
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
              <p className="text-sm text-muted-foreground mb-1">{t.properties.price}</p>
              <p className="text-3xl font-bold text-navy-950">
                {formatPropertyPrice(property.price, property.currency)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {operationLabels[property.operation] || property.operation}
                </Badge>
                {property.operation === "off-plan" && (
                  <Badge variant="outline" className="text-xs">
                    {t.properties.paymentPlan}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.properties.details}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.bedrooms != null && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Bed className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.properties.bedrooms}</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Bath className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.properties.bathrooms}</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Maximize className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.properties.area}</p>
                    <p className="font-medium">{property.area}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Building2 className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.properties.type}</p>
                  <p className="font-medium">{property.type}</p>
                </div>
              </div>
              {property.developer && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Tag className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.properties.developer}</p>
                    <p className="font-medium">{property.developer}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.properties.location}</CardTitle>
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
          {property.tags && property.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t.properties.tags}</CardTitle>
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
              <Button className="w-full bg-copper-500 hover:bg-copper-600" onClick={() => window.print()}>
                <FileText className="mr-2 h-4 w-4" />
                {t.properties.generatePdf}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard");
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t.properties.shareWithLead}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PropertyModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        property={property}
        onSuccess={fetchData}
      />
    </motion.div>
  );
}
