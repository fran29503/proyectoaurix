"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  MoreHorizontal,
  Eye,
  FileText,
  Share2,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyData, formatPropertyPrice } from "@/lib/data/properties";
import { useLanguage } from "@/lib/i18n";

interface PropertyCardProps {
  property: PropertyData;
  onEdit?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  disponible: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  reservado: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  vendido: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
};

export function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const { t } = useLanguage();
  const statusStyle = statusColors[property.status];

  const statusLabels: Record<string, string> = {
    disponible: t.properties.available,
    reservado: t.properties.reserved,
    vendido: t.properties.sold,
  };

  const operationLabels: Record<string, string> = {
    "off-plan": t.properties.offPlan,
    resale: t.properties.resale,
    rent: t.properties.rent,
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-48 bg-slate-200 dark:bg-slate-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-16 w-16 text-slate-400" />
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={cn("font-normal", statusStyle.bg, statusStyle.text)}>
            {statusLabels[property.status] || property.status}
          </Badge>
          <Badge variant="secondary" className="bg-white/90 dark:bg-slate-800/90">
            {operationLabels[property.operation] || property.operation}
          </Badge>
        </div>
        {/* Market flag */}
        <div className="absolute top-3 right-3">
          <span className="text-xl">{property.market === "dubai" ? "🇦🇪" : "🇺🇸"}</span>
        </div>
        {/* Quick actions on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/dashboard/properties/${property.id}`}>
            <Button size="sm" variant="secondary">
              <Eye className="mr-2 h-4 w-4" />
              {t.common.view}
            </Button>
          </Link>
          <Button size="sm" variant="secondary">
            <FileText className="mr-2 h-4 w-4" />
            {t.common.pdf}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title & Code */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link
              href={`/dashboard/properties/${property.id}`}
              className="font-semibold hover:text-copper-600 line-clamp-1"
            >
              {property.title}
            </Link>
            <p className="text-xs text-muted-foreground">{property.code}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border-slate-200">
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t.common.viewDetails}
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(property.id)} className="rounded-lg cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  {t.properties.editProperty}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                {t.common.generatePdf}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                {t.common.share}
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(property.id)}
                  className="rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t.common.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {property.zone}
          {property.developer && (
            <>
              <span className="mx-1">•</span>
              <span>{property.developer}</span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="text-xl font-bold text-navy-950 mb-3">
          {formatPropertyPrice(property.price, property.currency)}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            {property.bedrooms}
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms}
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            {property.area}
          </div>
        </div>

        {/* Tags */}
        {property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
            {property.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs font-normal">
                {feature}
              </Badge>
            ))}
            {property.features.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{property.features.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
