import { AppShell } from "@/components/app-shell";

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
