import { valueText } from "@/lib/canonical-profile";
import type { CoverLetterInput, CoverLetterResult, CvTailoringInput, CvTailoringResult, ExperienceBulletInput, ExperienceBulletResult, ProfessionalDocumentWriter, ProfessionalSummaryInput, ProfessionalSummaryResult } from "./professional-document.types";
import { buildCvContentFromCanonicalProfile } from "./cv-content-builder";
import { reviewCvQuality } from "./cv-quality";
import { createPresentationField } from "./presentation-fields";

const genericCliches = [/hardworking/i, /team player/i, /results-driven professional/i, /excellent communication skills/i];

function rejectUnsupportedMetrics(source: string, generated: string) {
  const metricPattern = /\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?\s*(?:million|thousand|clients|people|users|projects|teams)\b/i;
  return metricPattern.test(generated) && !metricPattern.test(source);
}

function actionLead(value: string) {
  const clean = value.trim().replace(/^responsible for\s+/i, "").replace(/^duties included\s+/i, "");
  if (!clean) return "";
  if (/^(managed|led|built|created|supported|coordinated|processed|analysed|developed|delivered|improved)\b/i.test(clean)) return clean;
  return `Supported ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
}

export class DeterministicProfessionalDocumentWriter implements ProfessionalDocumentWriter {
  async generateProfessionalSummary(input: ProfessionalSummaryInput): Promise<ProfessionalSummaryResult> {
    const profile = input.profile;
    const role = input.configuration.targetRole ?? valueText(profile.professionalProfile.headline) ?? valueText(profile.identity.professionalHeadline);
    const profession = valueText(profile.professionalProfile.profession) || role;
    const skills = profile.skills.filter((skill) => skill.status === "confirmed" || skill.explicitness !== "unconfirmed_implied").slice(0, 5).map((skill) => valueText(skill.canonicalName)).filter(Boolean);
    const education = profile.education.find((item) => item.reviewStatus === "confirmed" || item.reviewStatus === "needs_review");
    const experience = profile.employment.find((item) => item.status !== "archived");
    const parts = [
      profession ? `${profession} with a profile focused on ${role || profession}` : "",
      skills.length ? `brings practical strengths in ${skills.join(", ")}` : "",
      education ? `supported by ${valueText(education.qualification)}` : "",
      experience ? `and experience connected to ${valueText(experience.canonicalTitle)}` : ""
    ].filter(Boolean);
    const sentence = parts.length ? `${parts.join(", ")}.` : "Professional profile in progress, ready to be strengthened with confirmed experience, education, and skills.";
    const unsupportedClaims = genericCliches.filter((pattern) => pattern.test(sentence)).map(String);
    return {
      field: createPresentationField({
        value: sentence,
        canonicalFieldPath: "professionalProfile.professionalSummary",
        sourceType: "generated",
        userApproved: false,
        approvalState: "suggested",
        sourceFactIds: [
          ...profile.skills.slice(0, 5).map((skill) => skill.id),
          ...(education ? [education.id] : []),
          ...(experience ? [experience.id] : [])
        ],
        unsupportedClaimDetected: unsupportedClaims.length > 0,
        language: input.configuration.language
      }),
      validation: { grounded: unsupportedClaims.length === 0, unsupportedClaims }
    };
  }

  async improveExperienceBullet(input: ExperienceBulletInput): Promise<ExperienceBulletResult> {
    const improved = actionLead(input.sourceText).replace(/\.$/, "");
    const text = improved ? `${improved}.` : "";
    const unsupportedClaimDetected = rejectUnsupportedMetrics(input.sourceText, text);
    return {
      field: createPresentationField({
        value: text,
        canonicalEntityId: input.canonicalEntityId,
        canonicalFieldPath: "employment.bullets",
        originalCanonicalValue: input.sourceText,
        sourceType: "generated",
        userApproved: false,
        approvalState: "suggested",
        generatedForTargetJobId: undefined,
        sourceFactIds: input.sourceFactIds,
        unsupportedClaimDetected,
        language: input.language
      }),
      unsupportedClaimDetected
    };
  }

  async tailorCvContent(input: CvTailoringInput): Promise<CvTailoringResult> {
    const content = buildCvContentFromCanonicalProfile(input.profile, input.configuration);
    return { content, warnings: reviewCvQuality(content, input.configuration) };
  }

  async generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult> {
    const summary = await this.generateProfessionalSummary({ profile: input.profile, configuration: { purpose: "targeted", language: input.language, pagePreference: "automatic", targetRole: input.targetRole, sections: [], selectedEntityIds: { employment: [], education: [], certifications: [], skills: [], projects: [], languages: [] }, presentationPreferences: { showPhoto: false, showFullAddress: false, showReferences: false, showSkillLevels: false, showDates: true, dateFormat: "MMM yyyy" } } });
    return {
      content: {
        opening: createPresentationField({ value: `I am applying for the ${input.targetRole} opportunity${input.companyName ? ` at ${input.companyName}` : ""}.`, sourceType: "generated", userApproved: false, approvalState: "suggested", language: input.language }),
        evidence: summary.field,
        closing: createPresentationField({ value: "I would welcome the opportunity to discuss how my background can support this role.", sourceType: "generated", userApproved: false, approvalState: "suggested", language: input.language })
      },
      warnings: []
    };
  }
}

export const deterministicProfessionalDocumentWriter = new DeterministicProfessionalDocumentWriter();

