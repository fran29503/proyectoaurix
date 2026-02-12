"use client";

import { TenantProvider, TenantThemeProvider } from "@/lib/tenant";
import { LanguageProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/rbac";

interface TenantWrapperProps {
  children: React.ReactNode;
}

export function TenantWrapper({ children }: TenantWrapperProps) {
  return (
    <TenantProvider>
      <UserProvider>
        <LanguageProvider>
          <TenantThemeProvider>{children}</TenantThemeProvider>
        </LanguageProvider>
      </UserProvider>
    </TenantProvider>
  );
}
