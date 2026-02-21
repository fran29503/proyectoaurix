"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users,
  TrendingUp,
  Clock,
  Target,
  Filter,
  Mail,
  Phone,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { getTeamMembers, roleLabels, teamLabels, type TeamMember } from "@/lib/queries/team";
import { useLanguage } from "@/lib/i18n";
import { Can, ManagerOrAbove } from "@/lib/rbac";
import { useRouter } from "next/navigation";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  team_lead: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  agent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  backoffice: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function TeamMemberRow({ member }: { member: TeamMember }) {
  const { t } = useLanguage();
  const isAgent = ["agent", "team_lead"].includes(member.role);
  const roleKey = member.role as keyof typeof t.roles;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-navy-950 text-white">
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.full_name}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={cn("font-normal", roleColors[member.role])}>
          {t.roles[roleKey] || roleLabels[member.role] || member.role}
        </Badge>
      </TableCell>
      <TableCell>
        {member.team ? (
          <span>{teamLabels[member.team] || member.team}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-lg">{member.market === "dubai" ? "🇦🇪" : member.market === "usa" ? "🇺🇸" : "-"}</span>
      </TableCell>
      <TableCell>
        <Badge variant={member.is_active ? "default" : "secondary"} className={member.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : ""}>
          {member.is_active ? t.team.active : t.team.inactive}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`mailto:${member.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                {t.common.email}
              </a>
            </DropdownMenuItem>
            {member.phone && (
              <DropdownMenuItem asChild>
                <a href={`tel:${member.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {t.common.call}
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function TeamPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchTeam() {
      try {
        const data = await getTeamMembers();
        setMembers(data);
      } catch (err) {
        setError("loadTeamError");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  // Filter team members
  const filteredTeam = members.filter((member) => {
    if (marketFilter !== "all" && member.market !== marketFilter) return false;
    if (roleFilter !== "all" && member.role !== roleFilter) return false;
    return true;
  });

  // Calculate team stats
  const agents = members.filter((m) => ["agent", "team_lead"].includes(m.role));
  const activeCount = members.filter((m) => m.is_active).length;
  const dubaiCount = members.filter((m) => m.market === "dubai").length;
  const usaCount = members.filter((m) => m.market === "usa").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-copper-500" />
      </div>
    );
  }

  if (error) {
    const errorKey = error as keyof typeof t.messages;
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-red-600">{t.messages[errorKey] || error}</p>
        <Button onClick={() => window.location.reload()}>{t.properties.retry}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-950">{t.team.title}</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t.team.members}
          </p>
        </div>
        <Can resource="team" action="create">
          <Button size="sm" className="bg-copper-500 hover:bg-copper-600 w-fit" onClick={() => router.push("/dashboard/settings/users")}>
            {t.common.add}
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <Users className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">{t.team.members}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">{t.team.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-muted-foreground">{t.team.agents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dubaiCount}/{usaCount}</p>
                <p className="text-sm text-muted-foreground">{t.market.dubai} / {t.market.usa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.common.filters}:</span>
        </div>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-[110px] md:w-[130px]">
            <SelectValue placeholder={t.form.market} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.market.all}</SelectItem>
            <SelectItem value="dubai">{t.market.dubai}</SelectItem>
            <SelectItem value="usa">{t.market.usa}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[120px] md:w-[150px]">
            <SelectValue placeholder={t.team.role} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.roles.all}</SelectItem>
            <SelectItem value="admin">{t.roles.admin}</SelectItem>
            <SelectItem value="manager">{t.roles.manager}</SelectItem>
            <SelectItem value="team_lead">{t.roles.team_lead}</SelectItem>
            <SelectItem value="agent">{t.roles.agent}</SelectItem>
            <SelectItem value="backoffice">{t.roles.backoffice}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Table */}
      <Card>
        <CardContent className="p-0">
          <HorizontalScroll arrowSize="sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.member}</TableHead>
                <TableHead>{t.table.role}</TableHead>
                <TableHead>{t.table.team}</TableHead>
                <TableHead>{t.table.market}</TableHead>
                <TableHead>{t.table.status}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeam.length > 0 ? (
                filteredTeam.map((member) => (
                  <TeamMemberRow key={member.id} member={member} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t.form.noTeamMembers}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </HorizontalScroll>
        </CardContent>
      </Card>
    </div>
  );
}
