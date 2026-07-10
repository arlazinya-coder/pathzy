import { redirect } from "next/navigation";
import { appRoutes } from "@/lib/navigation/routes";

export default async function CvBuilderPage() {
  redirect(appRoutes.professionalIdentityCv);
}
