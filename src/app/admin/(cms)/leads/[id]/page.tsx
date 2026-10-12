import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/brand-icons";
import { LeadEditor } from "@/components/admin/lead-editor";
import { AdminHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/auth";
import { BUSINESS_TYPES, LEAD_TYPES, labelOf } from "@/lib/options";
import type { Lead } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function LeadPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("leads").select("*, events(title), programs(title)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const lead = data as Lead & { events?: { title: string } | null; programs?: { title: string } | null; consent_at?: string };
  const wa = whatsappLink(lead.phone);

  const rows: [string, string | null | undefined][] = [
    ["Enquiry type", labelOf(LEAD_TYPES, lead.lead_type)],
    ["Company", lead.company],
    ["Job title", lead.job_title],
    ["Email", lead.email],
    ["Phone / WhatsApp", lead.phone],
    ["Country", lead.country],
    ["Business type", lead.business_type ? labelOf(BUSINESS_TYPES, lead.business_type) : null],
    ["Service of interest", lead.service_interest],
    ["Event", lead.events?.title],
    ["Program / workshop", lead.programs?.title],
    ["Sent from page", lead.source_page],
    ["Received", new Date(lead.created_at).toLocaleString("en-GB")],
    ["Consent", lead.consent ? `Yes${lead.consent_at ? ` (${new Date(lead.consent_at).toLocaleString("en-GB")})` : ""}` : "No"],
  ];

  return (
    <>
      <AdminHeader title={lead.name} back={{ href: "/admin/leads", label: "Enquiries" }} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex flex-wrap gap-2">
              <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-paper hover:bg-olive-deep">
                <Mail className="size-4" /> Reply by email
              </a>
              {lead.phone && (
                <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-md border border-stone px-4 py-2 text-sm hover:border-ink">
                  <Phone className="size-4" /> Call
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-stone px-4 py-2 text-sm hover:border-ink">
                  <WhatsappIcon className="size-4" /> WhatsApp
                </a>
              )}
            </div>
            <dl className="divide-y divide-stone text-sm">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr]">
                    <dt className="text-muted">{k}</dt>
                    <dd className="break-words">{v}</dd>
                  </div>
                ))}
            </dl>
          </Card>
          {lead.message && (
            <Card className="p-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Message</h2>
              <p className="whitespace-pre-wrap leading-relaxed">{lead.message}</p>
            </Card>
          )}
        </div>
        <LeadEditor id={lead.id} status={lead.status} notes={lead.notes ?? ""} />
      </div>
    </>
  );
}
