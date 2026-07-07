import { MyDocumentsClient } from "@/components/professional-identity/my-documents-client";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

type SavedDocument = {
  id: string;
  tool: "cv" | "cover-letter" | "linkedin" | "recruiter-message" | "follow-up" | "career-passport" | "uploaded-document" | "supporting-document";
  title: string;
  content: string;
  contentJson?: Record<string, unknown> | null;
  template_name?: string | null;
  status?: string | null;
  version_number?: number | null;
  last_downloaded_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

function toolFromDocumentType(type: string): SavedDocument["tool"] {
  if (type === "cover_letter") return "cover-letter";
  if (type === "linkedin_profile") return "linkedin";
  if (type === "recruiter_message") return "recruiter-message";
  if (type === "follow_up_email" || type === "thank_you_email") return "follow-up";
  if (type === "career_passport") return "career-passport";
  if (type === "uploaded_document" || type === "old_cv") return "uploaded-document";
  if (type === "supporting_document") return "supporting-document";
  return "cv";
}

export default async function MyDocumentsPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/documents");
  let documents: SavedDocument[] = [];
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);

  const { data: unifiedDocuments, error: unifiedError } = await supabase
    .from("user_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!unifiedError && unifiedDocuments?.length) {
    documents = unifiedDocuments.map((row) => ({
      id: row.id,
      tool: toolFromDocumentType(row.document_type),
      title: row.document_title,
      content: row.content_text ?? "",
      contentJson: row.content_json ?? null,
      template_name: row.template_name,
      status: row.status,
      version_number: row.version_number,
      last_downloaded_at: row.last_downloaded_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  } else {
    const entries = await Promise.all([
      supabase.from("cv_documents").select("id,title,content,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("cover_letters").select("id,title,content,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("linkedin_profiles").select("id,headline,about,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("recruiter_messages").select("id,role,message,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("follow_up_emails").select("id,role,email_content,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("career_passport_summaries").select("id,career_goal,summary,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false })
    ]);

    documents = [
      ...(entries[0].data ?? []).map((row) => ({ id: row.id, tool: "cv" as const, title: row.title, content: row.content, created_at: row.created_at, updated_at: row.updated_at })),
      ...(entries[1].data ?? []).map((row) => ({ id: row.id, tool: "cover-letter" as const, title: row.title, content: row.content, created_at: row.created_at, updated_at: row.updated_at })),
      ...(entries[2].data ?? []).map((row) => ({ id: row.id, tool: "linkedin" as const, title: row.headline, content: row.about, created_at: row.created_at, updated_at: row.updated_at })),
      ...(entries[3].data ?? []).map((row) => ({ id: row.id, tool: "recruiter-message" as const, title: row.role || "Recruiter message", content: row.message, created_at: row.created_at, updated_at: row.updated_at })),
      ...(entries[4].data ?? []).map((row) => ({ id: row.id, tool: "follow-up" as const, title: row.role || "Follow-up email", content: row.email_content, created_at: row.created_at, updated_at: row.updated_at })),
      ...(entries[5].data ?? []).map((row) => ({ id: row.id, tool: "career-passport" as const, title: row.career_goal || "Career Passport", content: row.summary, created_at: row.created_at, updated_at: row.updated_at }))
    ].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="My Documents">
        View, edit, copy, download, rename, duplicate, and delete the documents you create in PATHZY.
      </PageHeader>
      <MyDocumentsClient initialDocuments={documents} canExport={canExport} />
    </div>
  );
}
