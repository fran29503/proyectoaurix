"use client";

import { useLanguage, languages, type Language } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Globe className="mr-2 h-4 w-4" />
        <span>{t.common.language}</span>
        <span className="ml-auto text-sm opacity-60">{currentLang?.flag}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="bg-white min-w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={cn(
              "cursor-pointer flex items-center justify-between",
              language === lang.code && "bg-violet-50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-violet-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
