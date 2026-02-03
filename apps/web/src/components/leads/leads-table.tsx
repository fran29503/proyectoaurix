"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { LeadData, formatBudgetRange } from "@/lib/data/leads";
import { PIPELINE_STAGES, INTENT_LEVELS } from "@/types";

interface LeadsTableProps {
  data: LeadData[];
}

const statusColors: Record<string, string> = {
  nuevo: "bg-slate-100 text-slate-700 border-slate-200",
  contactado: "bg-blue-100 text-blue-700 border-blue-200",
  calificado: "bg-cyan-100 text-cyan-700 border-cyan-200",
  meeting_programado: "bg-violet-100 text-violet-700 border-violet-200",
  meeting_realizado: "bg-purple-100 text-purple-700 border-purple-200",
  oferta_reserva: "bg-amber-100 text-amber-700 border-amber-200",
  negociacion: "bg-orange-100 text-orange-700 border-orange-200",
  cerrado_ganado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cerrado_perdido: "bg-red-100 text-red-700 border-red-200",
  dormido: "bg-gray-100 text-gray-600 border-gray-200",
};

const intentColors: Record<string, string> = {
  alta: "bg-emerald-100 text-emerald-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-red-100 text-red-700",
};

const channelLabels: Record<string, string> = {
  meta_ads: "Meta Ads",
  google: "Google",
  portal: "Portal",
  referral: "Referral",
  partner: "Partner",
};

export function LeadsTable({ data }: LeadsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<LeadData>[] = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Lead
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-navy-950 text-white text-xs">
                  {getInitials(lead.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="font-medium hover:text-copper-600 hover:underline"
                >
                  {lead.fullName}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {lead.market === "dubai" ? "🇦🇪" : "🇺🇸"} {lead.countryResidence}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const stage = PIPELINE_STAGES.find((s) => s.id === status);
          return (
            <Badge variant="outline" className={cn("font-normal", statusColors[status])}>
              {stage?.label || status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value;
        },
      },
      {
        accessorKey: "intent",
        header: "Intent",
        cell: ({ row }) => {
          const intent = row.getValue("intent") as string | null;
          if (!intent) return <span className="text-muted-foreground">-</span>;
          return (
            <Badge variant="secondary" className={cn("font-normal", intentColors[intent])}>
              {intent.charAt(0).toUpperCase() + intent.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => {
          const channel = row.getValue("channel") as string;
          const source = row.original.source;
          return (
            <div>
              <span className="text-sm">{channelLabels[channel] || channel}</span>
              {source && (
                <span className="block text-xs text-muted-foreground capitalize">
                  {source.replace("_", " ")}
                </span>
              )}
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value === "all" || row.getValue(id) === value;
        },
      },
      {
        accessorKey: "interestZone",
        header: "Interest",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div>
              <span className="text-sm">{lead.interestZone || "-"}</span>
              {lead.interestType && (
                <span className="block text-xs text-muted-foreground">
                  {lead.interestType}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "budgetMin",
        header: "Budget",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <span className="text-sm font-medium">
              {formatBudgetRange(lead.budgetMin, lead.budgetMax, lead.budgetCurrency)}
            </span>
          );
        },
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned",
        cell: ({ row }) => {
          const assignee = row.original.assignedTo;
          if (!assignee) return <span className="text-muted-foreground">Unassigned</span>;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                  {getInitials(assignee.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee.fullName.split(" ")[0]}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("createdAt") as string;
          return <span className="text-sm text-muted-foreground">{formatRelativeTime(date)}</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/leads/${lead.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Call {lead.phone}
                </DropdownMenuItem>
                {lead.email && (
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {PIPELINE_STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={(table.getColumn("channel")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => table.getColumn("channel")?.setFilterValue(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="meta_ads">Meta Ads</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="portal">Portal</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} leads
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
