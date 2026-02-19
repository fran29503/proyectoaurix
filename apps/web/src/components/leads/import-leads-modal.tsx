"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logAuditAction } from "@/lib/queries/audit";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

interface ImportLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ParsedRow {
  full_name: string;
  email?: string;
  phone?: string;
  channel?: string;
  campaign?: string;
  market?: string;
  interest_zone?: string;
  interest_type?: string;
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string;
  intent?: string;
  country_residence?: string;
  language?: string;
}

type ImportStep = "upload" | "preview" | "importing" | "done";

const EXPECTED_HEADERS = [
  "full_name", "email", "phone", "channel", "campaign", "market",
  "interest_zone", "interest_type", "budget_min", "budget_max",
  "budget_currency", "intent", "country_residence", "language",
];

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  // Remove BOM if present
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
  );

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (values[i]) obj[h] = values[i];
    });
    return obj;
  });

  return { headers, rows };
}

function validateRow(row: Record<string, string>, index: number): { parsed: ParsedRow; errors: string[] } {
  const errors: string[] = [];
  const name = row.full_name || row.name || row.nombre || "";
  if (!name) errors.push(`Row ${index + 1}: full_name is required`);

  const parsed: ParsedRow = {
    full_name: name,
    email: row.email || undefined,
    phone: row.phone || row.telefono || undefined,
    channel: row.channel || row.canal || undefined,
    campaign: row.campaign || row.campana || undefined,
    market: row.market || row.mercado || undefined,
    interest_zone: row.interest_zone || row.zona || undefined,
    interest_type: row.interest_type || row.tipo || undefined,
    budget_min: row.budget_min ? Number(row.budget_min) || undefined : undefined,
    budget_max: row.budget_max ? Number(row.budget_max) || undefined : undefined,
    budget_currency: row.budget_currency || row.currency || "USD",
    intent: row.intent || undefined,
    country_residence: row.country_residence || row.country || row.pais || undefined,
    language: row.language || row.idioma || undefined,
  };

  return { parsed, errors };
}

export function ImportLeadsModal({ open, onOpenChange, onSuccess }: ImportLeadsModalProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ImportStep>("upload");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState({ success: 0, failed: 0 });

  const resetState = () => {
    setStep("upload");
    setFileName("");
    setParsedRows([]);
    setErrors([]);
    setImportResult({ success: 0, failed: 0 });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows } = parseCsv(text);
      const allErrors: string[] = [];
      const validRows: ParsedRow[] = [];

      rows.forEach((row, i) => {
        const { parsed, errors: rowErrors } = validateRow(row, i);
        allErrors.push(...rowErrors);
        if (rowErrors.length === 0) validRows.push(parsed);
      });

      setParsedRows(validRows);
      setErrors(allErrors);
      setStep("preview");
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setStep("importing");

    const supabase = createClient();

    // Get tenant_id
    const { data: tenant } = await supabase.from("tenants").select("id").limit(1).single();
    if (!tenant?.id) {
      toast.error(t.messages.createError);
      setStep("preview");
      return;
    }

    let success = 0;
    let failed = 0;

    // Batch insert in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < parsedRows.length; i += chunkSize) {
      const chunk = parsedRows.slice(i, i + chunkSize).map((row) => ({
        full_name: row.full_name,
        email: row.email || null,
        phone: row.phone || null,
        channel: row.channel || null,
        campaign: row.campaign || null,
        market: row.market || "dubai",
        interest_zone: row.interest_zone || null,
        interest_type: row.interest_type || null,
        budget_min: row.budget_min || null,
        budget_max: row.budget_max || null,
        budget_currency: row.budget_currency || "USD",
        intent: row.intent || null,
        country_residence: row.country_residence || null,
        language: row.language || null,
        status: "nuevo",
        tenant_id: tenant.id,
      }));

      const { data, error } = await supabase.from("leads").insert(chunk).select("id");

      if (error) {
        failed += chunk.length;
      } else {
        success += data?.length || 0;
      }
    }

    setImportResult({ success, failed });
    setStep("done");

    if (success > 0) {
      logAuditAction({
        action: "import",
        resource: "lead",
        metadata: { imported: success, failed, total: parsedRows.length },
      }).catch(() => {});
    }
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      resetState();
    }
    onOpenChange(openState);
    if (!openState && importResult.success > 0) {
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-violet-600" />
            {t.common.import} {t.leads.title}
          </DialogTitle>
          <DialogDescription>
            CSV format: full_name, email, phone, channel, campaign, market, interest_zone, interest_type, budget_min, budget_max, budget_currency, intent
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Click to select CSV file
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  .csv files only
                </p>
              </button>
            </motion.div>
          )}

          {/* Step 2: Preview */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 space-y-4"
            >
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium">{fileName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">{parsedRows.length}</p>
                  <p className="text-xs text-emerald-600">Valid rows</p>
                </div>
                {errors.length > 0 && (
                  <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{errors.length}</p>
                    <p className="text-xs text-red-600">Errors</p>
                  </div>
                )}
              </div>

              {errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-lg border border-red-200 dark:border-red-800 p-3 space-y-1">
                  {errors.slice(0, 10).map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                  {errors.length > 10 && (
                    <p className="text-xs text-red-400">...and {errors.length - 10} more</p>
                  )}
                </div>
              )}

              {/* Preview table */}
              {parsedRows.length > 0 && (
                <div className="max-h-48 overflow-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">#</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">Phone</th>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">Market</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="px-3 py-1.5 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-1.5 font-medium">{row.full_name}</td>
                          <td className="px-3 py-1.5 text-slate-500">{row.email || "-"}</td>
                          <td className="px-3 py-1.5 text-slate-500">{row.phone || "-"}</td>
                          <td className="px-3 py-1.5 text-slate-500">{row.market || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 5 && (
                    <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800">
                      +{parsedRows.length - 5} more rows
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Importing */}
          {step === "importing" && (
            <motion.div
              key="importing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-sm text-slate-600">
                Importing {parsedRows.length} leads...
              </p>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center space-y-4"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Import Complete
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {importResult.success} leads imported successfully
                  {importResult.failed > 0 && `, ${importResult.failed} failed`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={resetState}>{t.common.back}</Button>
              <Button
                onClick={handleImport}
                disabled={parsedRows.length === 0}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              >
                {t.common.import} {parsedRows.length} {t.leads.title.toLowerCase()}
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={() => handleClose(false)} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              {t.common.close}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
