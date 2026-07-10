import { redirect } from "next/navigation";
import { appRoutes } from "@/lib/navigation/routes";

export default async function DashboardPage() {
  redirect(appRoutes.roadmap);
}
