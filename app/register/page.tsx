import { redirect } from "next/navigation";
import { appRoutes } from "@/lib/navigation/routes";

export default function RegisterPage() {
  redirect(appRoutes.signup);
}
