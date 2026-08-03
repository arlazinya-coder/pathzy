import { redirect } from "next/navigation";
import { professionalIdentityReviewHref } from "@/lib/navigation/auth-routing";

export default function ProfessionalIdentityReviewRoute() {
  redirect(professionalIdentityReviewHref());
}
