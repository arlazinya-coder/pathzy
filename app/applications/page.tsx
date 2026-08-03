import { EmploymentTrackerPage } from "@/app/employment-tracker/page";
import { appRoutes } from "@/lib/navigation/routes";

export default async function ApplicationsPage() {
  return EmploymentTrackerPage({ redirectTo: appRoutes.applications });
}
