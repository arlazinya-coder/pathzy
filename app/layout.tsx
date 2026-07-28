import type { Metadata } from "next";
import "./globals.css";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";

export const metadata: Metadata = {
  title: "PATHZY | The Employment Support System",
  description: "From Potential to Employment. PATHZY helps people become more employable, prepare stronger applications, and move toward work with confidence."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialLanguage = await getServerInterfaceLanguage();

  return (
    <html lang={initialLanguage}>
      <body>{children}</body>
    </html>
  );
}
