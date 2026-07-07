import { EmploymentTrackerPage } from "@/app/employment-tracker/page";

export default async function ApplicationsPage() {
  return EmploymentTrackerPage({ redirectTo: "/applications" });
}
