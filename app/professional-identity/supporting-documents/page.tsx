import { SupportingDocumentsClient } from "@/components/professional-identity/supporting-documents-client";
import { PageHeader } from "@/components/ui";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function SupportingDocumentsPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/supporting-documents");
  const { data } = await supabase
    .from("user_documents")
    .select("id,document_title,content_text,content_json,status,created_at,updated_at")
    .eq("user_id", user.id)
    .eq("document_type", "supporting_document")
    .order("updated_at", { ascending: false });

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Supporting Documents">
        Store employment proof such as certificates, diplomas, transcripts, portfolio files, awards, licences, and recommendation letters.
      </PageHeader>
      <SupportingDocumentsClient
        initialDocuments={(data ?? []).map((document) => ({
          id: document.id,
          title: document.document_title,
          content: document.content_text ?? "",
          contentJson: document.content_json,
          status: document.status,
          created_at: document.created_at,
          updated_at: document.updated_at
        }))}
      />
    </div>
  );
}
