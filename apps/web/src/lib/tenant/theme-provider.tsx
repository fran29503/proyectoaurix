"use client";

import { useEffect } from "react";
import { useTenant, type TenantBranding } from "./context";

// Convert hex to HSL for CSS variables
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Generate color palette from primary color
function generatePalette(hex: string) {
  const hsl = hexToHSL(hex);
  return {
    50: `${hsl.h} ${hsl.s}% 97%`,
    100: `${hsl.h} ${hsl.s}% 94%`,
    200: `${hsl.h} ${hsl.s}% 86%`,
    300: `${hsl.h} ${hsl.s}% 74%`,
    400: `${hsl.h} ${hsl.s}% 62%`,
    500: `${hsl.h} ${hsl.s}% ${hsl.l}%`,
    600: `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 10, 20)}%`,
    700: `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 20, 15)}%`,
    800: `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 30, 10)}%`,
    900: `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 40, 5)}%`,
  };
}

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { branding, loading } = useTenant();

  useEffect(() => {
    if (loading) return;

    // Apply CSS custom properties based on tenant branding
    const root = document.documentElement;

    // Generate primary color palette
    const primaryPalette = generatePalette(branding.primaryColor);
    const accentPalette = generatePalette(branding.accentColor);

    // Set CSS variables
    root.style.setProperty("--tenant-primary", branding.primaryColor);
    root.style.setProperty("--tenant-accent", branding.accentColor);

    // Set primary palette
    Object.entries(primaryPalette).forEach(([shade, value]) => {
      root.style.setProperty(`--primary-${shade}`, value);
    });

    // Set accent palette
    Object.entries(accentPalette).forEach(([shade, value]) => {
      root.style.setProperty(`--accent-${shade}`, value);
    });

    // Set font family
    if (branding.fontFamily) {
      root.style.setProperty("--font-sans", branding.fontFamily);
    }

    // Update document title
    document.title = `${branding.companyName} | Dashboard`;

    // Update favicon if provided
    if (branding.faviconUrl) {
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link) {
        link.href = branding.faviconUrl;
      }
    }
  }, [branding, loading]);

  return <>{children}</>;
}

// Hook to get tenant-aware styles
export function useTenantStyles() {
  const { branding } = useTenant();

  return {
    // Primary button gradient
    primaryGradient: `linear-gradient(to right, ${branding.primaryColor}, ${adjustBrightness(branding.primaryColor, -20)})`,

    // Primary colors
    primaryColor: branding.primaryColor,
    accentColor: branding.accentColor,

    // Gradient classes (for Tailwind)
    gradientFrom: branding.primaryColor,
    gradientTo: adjustBrightness(branding.primaryColor, -20),

    // Logo
    logoUrl: branding.logoUrl,
    logoWhiteUrl: branding.logoWhiteUrl,

    // Company info
    companyName: branding.companyName,
    companyShortName: branding.companyShortName,
  };
}

// Helper to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
