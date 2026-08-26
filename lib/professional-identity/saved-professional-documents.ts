import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedProfessionalDocument } from "@/lib/professional-identity/professional-identity-types";

type SavedProfessionalTool = GeneratedProfessionalDocument["tool"];
type SavedDocumentType = "cv" | "cover_letter" | "linkedin_profile" | "recruiter_message" | "follow_up_email" | "career_passport";

const toolToDocumentType: Record<SavedProfessionalTool, SavedDocumentType> = {
  cv: "cv",
  "cover-letter": "cover_letter",
  linkedin: "linkedin_profile",
  "recruiter-message": "recruiter_message",
  "follow-up": "follow_up_email",
  "career-passport": "career_passport"
};

const documentTypeToTool: Record<SavedDocumentType, SavedProfessionalTool> = {
  cv: "cv",
  cover_letter: "cover-letter",
  linkedin_profile: "linkedin",
  recruiter_message: "recruiter-message",
  follow_up_email: "follow-up",
  career_passport: "career-passport"
};

type UserDocumentRow = {
  id: string;
  document_type: SavedDocumentType;
  document_title: string | null;
  content_text: string | null;
  content_json: Record<string, unknown> | null;
  template_name: string | null;
  status: string | null;
  version_number: number | null;
  created_at: string | null;
  updated_at: string | null;
  last_downloaded_at: string | null;
};

export function savedProfessionalDocumentFromRow(row: UserDocumentRow): GeneratedProfessionalDocument {
  const contentJson = row.content_json && typeof row.content_json === "object" ? row.content_json : null;
  const tool = documentTypeToTool[row.document_type] ?? "cv";
  return {
    id: row.id,
    tool,
    title: row.document_title ?? tool.replace(/-/g, " "),
    content: row.content_text ?? "",
    contentJson,
    template_name: row.template_name,
    status: row.status,
    version_number: row.version_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_downloaded_at: row.last_downloaded_at,
    fields: contentJson && "fields" in contentJson ? contentJson.fields as GeneratedProfessionalDocument["fields"] : undefined
  };
}

export async function loadSavedProfessionalDocument(
  supabase: SupabaseClient,
  userId: string,
  input: { tool: SavedProfessionalTool; documentId?: string | null }
): Promise<GeneratedProfessionalDocument | null> {
  let query = supabase
    .from("user_documents")
    .select("id,document_type,document_title,content_text,content_json,template_name,status,version_number,created_at,updated_at,last_downloaded_at")
    .eq("user_id", userId);

  if (input.documentId) {
    query = query.eq("id", input.documentId);
  } else {
    query = query
      .eq("document_type", toolToDocumentType[input.tool])
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .limit(1);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return savedProfessionalDocumentFromRow(data as UserDocumentRow);
}
