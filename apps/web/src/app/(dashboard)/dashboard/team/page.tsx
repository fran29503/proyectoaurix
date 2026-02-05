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
import { getTeamMembers, roleLabels, teamLabels, type TeamMember } from "@/lib/queries/team";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  team_lead: "bg-cyan-100 text-cyan-700",
  agent: "bg-slate-100 text-slate-700",
  backoffice: "bg-gray-100 text-gray-600",
};

function TeamMemberRow({ member }: { member: TeamMember }) {
  const isAgent = ["agent", "team_lead"].includes(member.role);

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
          {roleLabels[member.role] || member.role}
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
        <Badge variant={member.is_active ? "default" : "secondary"} className={member.is_active ? "bg-emerald-100 text-emerald-700" : ""}>
          {member.is_active ? "Active" : "Inactive"}
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
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </DropdownMenuItem>
            {member.phone && (
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function TeamPage() {
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
        setError("Failed to load team members");
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
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members
          </p>
        </div>
        <Button size="sm" className="bg-copper-500 hover:bg-copper-600">
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                <Users className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
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
                <p className="text-sm text-muted-foreground">Active</p>
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
                <p className="text-sm text-muted-foreground">Agents</p>
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
                <p className="text-sm text-muted-foreground">Dubai / USA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="dubai">Dubai</SelectItem>
            <SelectItem value="usa">USA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="team_lead">Team Lead</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="backoffice">Back Office</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Status</TableHead>
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
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
