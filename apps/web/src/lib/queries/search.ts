import { createClient } from "@/lib/supabase/client";

export interface SearchResult {
  id: string;
  type: "lead" | "property" | "task";
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const supabase = createClient();
  const term = `%${query}%`;

  const [leadsRes, propertiesRes, tasksRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, email, status")
      .or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
      .limit(5),
    supabase
      .from("properties")
      .select("id, title, code, zone")
      .or(`title.ilike.${term},zone.ilike.${term},code.ilike.${term}`)
      .limit(5),
    supabase
      .from("tasks")
      .select("id, title, status, priority")
      .ilike("title", term)
      .limit(5),
  ]);

  const results: SearchResult[] = [];

  if (leadsRes.data) {
    for (const l of leadsRes.data) {
      results.push({
        id: l.id,
        type: "lead",
        title: l.full_name,
        subtitle: l.email || l.status,
        href: `/dashboard/leads/${l.id}`,
      });
    }
  }

  if (propertiesRes.data) {
    for (const p of propertiesRes.data) {
      results.push({
        id: p.id,
        type: "property",
        title: p.title,
        subtitle: `${p.code} · ${p.zone}`,
        href: `/dashboard/properties/${p.id}`,
      });
    }
  }

  if (tasksRes.data) {
    for (const t of tasksRes.data) {
      results.push({
        id: t.id,
        type: "task",
        title: t.title,
        subtitle: `${t.priority} · ${t.status}`,
        href: `/dashboard/tasks`,
      });
    }
  }

  return results;
}
