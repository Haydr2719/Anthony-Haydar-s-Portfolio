import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cms/auth";
import { BUSINESS_TYPES, LEAD_STATUSES, LEAD_TYPES, labelOf } from "@/lib/options";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

const COLUMNS: [string, (l: Lead) => string | null | undefined][] = [
  ["Received", (l) => l.created_at],
  ["Status", (l) => labelOf(LEAD_STATUSES, l.status)],
  ["Type", (l) => labelOf(LEAD_TYPES, l.lead_type)],
  ["Name", (l) => l.name],
  ["Company", (l) => l.company],
  ["Job title", (l) => l.job_title],
  ["Email", (l) => l.email],
  ["Phone", (l) => l.phone],
  ["Country", (l) => l.country],
  ["Business type", (l) => (l.business_type ? labelOf(BUSINESS_TYPES, l.business_type) : "")],
  ["Service", (l) => l.service_interest],
  ["Message", (l) => l.message],
  ["Page", (l) => l.source_page],
  ["Notes", (l) => l.notes],
];

function csvCell(v: string | null | undefined) {
  let s = v ?? "";
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const lines = [COLUMNS.map(([h]) => csvCell(h)).join(","), ...((data ?? []) as Lead[]).map((l) => COLUMNS.map(([, f]) => csvCell(f(l))).join(","))];
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
