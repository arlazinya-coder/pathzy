import { redirect } from "next/navigation";
import { appRoutes } from "@/lib/navigation/routes";

export default function LegacyProfileRedirect() {
  redirect(appRoutes.settings);
}
