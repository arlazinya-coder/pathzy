import { ButtonLink, Card } from "@/components/ui";
import type { EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { appRoutes } from "@/lib/navigation/routes";

export function EmptyIntelligenceState({ language }: { language: EmploymentIntelligenceLanguage }) {
  return (
    <Card>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{language === "fr" ? "Pas encore évalué" : "Not yet assessed"}</p>
      <h2 className="mt-2 text-3xl font-black text-white">{language === "fr" ? "Terminez votre Diagnostic d'emploi" : "Complete your Employment Diagnosis"}</h2>
      <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/64">
        {language === "fr" ? "PATHZY a besoin de votre diagnostic pour créer une action principale, vos atouts, vos freins et votre plan." : "PATHZY needs your diagnosis to create a primary action, strengths, barriers and plan."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={appRoutes.discovery}>{language === "fr" ? "Ouvrir le diagnostic" : "Open Diagnosis"}</ButtonLink>
        <ButtonLink href={appRoutes.professionalIdentity} variant="secondary">{language === "fr" ? "Vérifier mon profil" : "Review Profile"}</ButtonLink>
      </div>
    </Card>
  );
}
