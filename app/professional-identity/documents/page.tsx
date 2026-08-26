import { MyDocumentsClient } from "@/components/professional-identity/my-documents-client";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments } from "@/lib/professional-identity/professional-identity-service";
import { isWorkflowDocumentType, vaultDocumentFromRow } from "@/lib/professional-identity/document-vault";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function MyDocumentsPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/documents");

  const [canExport, documentsResult] = await Promise.all([
    canCurrentUserExportProfessionalDocuments(supabase, user.id),
    supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
  ]);

  const documents = (documentsResult.data ?? [])
    .filter((row) => !isWorkflowDocumentType(row.document_type))
    .map((row) => vaultDocumentFromRow(row as Record<string, unknown>))
    .filter((document): document is NonNullable<typeof document> => Boolean(document));

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="My Documents">
        Keep the documents you may need for job applications in one organised place.
      </PageHeader>
      <MyDocumentsClient initialDocuments={documents} canExport={canExport} />
    </div>
  );
}
