import { redirect } from "next/navigation";
import { professionalIdentitySectionHref } from "@/lib/navigation/auth-routing";

export default async function ProfessionalIdentitySectionRoute({
  params,
  searchParams
}: {
  params: Promise<{ sectionId: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const [{ sectionId }, query] = await Promise.all([params, searchParams ?? Promise.resolve({} as { returnTo?: string })]);
  redirect(professionalIdentitySectionHref(sectionId, query.returnTo));
}
