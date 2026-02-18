export interface CsvColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): void {
  // Header row
  const headerRow = columns.map((col) => escapeCsvValue(col.header)).join(",");

  // Data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const raw = col.accessor(row);
        if (raw === null || raw === undefined) return "";
        return escapeCsvValue(String(raw));
      })
      .join(",")
  );

  // Combine with BOM for UTF-8 Excel compatibility
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\n");

  // Download via Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
