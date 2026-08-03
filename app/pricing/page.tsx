import { redirect } from "next/navigation";
import { routeBuilders } from "@/lib/navigation/routes";

export default function PricingPage() {
  redirect(routeBuilders.login("/billing"));
}
