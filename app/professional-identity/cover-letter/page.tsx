import { EliteCoverLetterTool } from "@/components/professional-identity/elite-cover-letter-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments } from "@/lib/professional-identity/professional-identity-service";
import { buildCoverLetterProfileFacts, normalizeCoverLetterTemplate } from "@/lib/professional-identity/elite-cover-letter-engine";
import type { EliteCoverLetterData, EliteCoverLetterSavedDocument } from "@/lib/professional-identity/elite-cover-letter-engine";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function CoverLetterPage({ searchParams }: { searchParams?: Promise<{ role?: string; company?: string }> }) {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/cover-letter");
  const params = searchParams ? await searchParams : {};
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);

  const [{ data: profile }, { data: discovery }, { data: latestCv }, { data: latestCoverLetter }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,phone,city,country,career_goal,education,highest_qualification,field_of_study,current_status,employment_status,linkedin_url,portfolio_url")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_documents")
      .select("content_json")
      .eq("user_id", user.id)
      .eq("document_type", "cv")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .eq("document_type", "cover_letter")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const facts = buildCoverLetterProfileFacts(
    profile ?? null,
    (discovery?.answers ?? {}) as Record<string, unknown>,
    (latestCv?.content_json ?? {}) as Record<string, unknown>
  );
  const contentJson = (latestCoverLetter?.content_json ?? {}) as Record<string, unknown>;
  const eliteCoverLetterData = contentJson.eliteCoverLetterData as EliteCoverLetterData | undefined;
  const initialDocument: EliteCoverLetterSavedDocument | null = latestCoverLetter && eliteCoverLetterData
    ? {
        id: latestCoverLetter.id,
        title: latestCoverLetter.document_title,
        data: eliteCoverLetterData,
        templateName: normalizeCoverLetterTemplate(latestCoverLetter.template_name ?? eliteCoverLetterData.selectedTemplate),
        updatedAt: latestCoverLetter.updated_at ?? null,
        lastDownloadedAt: latestCoverLetter.last_downloaded_at ?? null
      }
    : null;

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Create My Cover Letter">
        Build a focused, recruiter-ready cover letter from your real profile and the job you want to apply for.
      </PageHeader>
      <EliteCoverLetterTool
        initialFacts={facts}
        initialDocument={initialDocument}
        canExport={canExport}
        initialRole={params.role ?? ""}
        initialCompany={params.company ?? ""}
      />
    </div>
  );
}

