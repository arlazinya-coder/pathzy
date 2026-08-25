import type { Opportunity, OpportunityCategory } from "@/lib/opportunities/types";
import type { JobProvider, JobProviderSearchInput, JobProviderSearchResult } from "./types";

type AdzunaJob = {
  id?: string | number;
  title?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  location?: {
    display_name?: string;
    area?: string[];
  };
  company?: {
    display_name?: string;
  };
  category?: {
    label?: string;
    tag?: string;
  };
};

type AdzunaSearchResponse = {
  results?: AdzunaJob[];
};

const adzunaEndpointRoot = "https://api.adzuna.com/v1/api/jobs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/<[^>]+>/g, " ").trim().replace(/\s+/g, " ") : "";
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function countryCode(value: string | undefined) {
  const clean = cleanText(value).toLowerCase();
  if (!clean) return "za";
  const map: Record<string, string> = {
    "south africa": "za",
    za: "za",
    "united states": "us",
    usa: "us",
    us: "us",
    "united kingdom": "gb",
    uk: "gb",
    gb: "gb",
    france: "fr",
    fr: "fr",
    canada: "ca",
    ca: "ca",
    australia: "au",
    au: "au",
    germany: "de",
    de: "de"
  };
  return map[clean] ?? clean.slice(0, 2);
}

function employmentType(job: AdzunaJob) {
  const values = [job.contract_time, job.contract_type].map(cleanText).filter(Boolean);
  return values.length ? values.map((item) => item.replaceAll("_", " ")).join(" / ") : "Not specified";
}

function workMode(job: AdzunaJob): Opportunity["mode"] {
  const text = `${job.title ?? ""} ${job.description ?? ""} ${job.location?.display_name ?? ""}`.toLowerCase();
  if (/\bremote\b|work from home|home based/.test(text)) return "Remote";
  if (/\bhybrid\b/.test(text)) return "Hybrid";
  return "On-site";
}

function remoteType(mode: Opportunity["mode"]): Opportunity["remoteType"] {
  if (mode === "Remote" || mode === "Online") return "REMOTE";
  if (mode === "Hybrid") return "HYBRID";
  if (mode === "On-site") return "ON_SITE";
  return "UNKNOWN";
}

function currencyForCountry(country: string) {
  const map: Record<string, string> = {
    za: "ZAR",
    us: "USD",
    gb: "GBP",
    fr: "EUR",
    ca: "CAD",
    au: "AUD",
    de: "EUR"
  };
  return map[country] ?? undefined;
}

function category(job: AdzunaJob): OpportunityCategory {
  const text = `${job.title ?? ""} ${job.category?.label ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (/\bintern(ship)?\b/.test(text)) return "Internships";
  if (/\blearnership\b/.test(text)) return "Learnerships";
  if (/\bapprentice(ship)?\b/.test(text)) return "Apprenticeships";
  return "Recommended jobs";
}

function extractRequirementSignals(description: string) {
  const parts = description
    .split(/(?:\.|;|\n|<br\s*\/?>)/i)
    .map(cleanText)
    .filter((item) => item.length > 3 && item.length < 180);
  const requirementSignals = /\b(required|requirement|must|essential|need|qualification|experience|license|licence|certificate|certification|skill|proficient|fluent)\b/i;
  const preferredSignals = /\b(preferred|advantage|nice to have|beneficial|plus|desirable)\b/i;
  const responsibilitySignals = /\b(responsible|duties|manage|support|coordinate|deliver|prepare|maintain|assist|handle)\b/i;
  const requirements = parts.filter((part) => requirementSignals.test(part)).slice(0, 8);
  const preferredSkills = parts.filter((part) => preferredSignals.test(part)).slice(0, 6);
  const responsibilities = parts.filter((part) => responsibilitySignals.test(part)).slice(0, 8);
  return {
    responsibilities,
    requirements,
    requiredSkills: requirements,
    preferredSkills,
    requiredEducation: requirements.filter((item) => /\b(degree|diploma|matric|qualification|education|certificate)\b/i.test(item)),
    preferredEducation: preferredSkills.filter((item) => /\b(degree|diploma|qualification|education|certificate)\b/i.test(item)),
    licences: requirements.filter((item) => /\b(driver'?s? licence|driving licence|license|licence|pdp|prdp)\b/i.test(item)),
    certifications: requirements.filter((item) => /\b(certification|certificate|certified)\b/i.test(item)),
    languages: requirements.filter((item) => /\b(english|french|afrikaans|zulu|xhosa|language|fluent|bilingual)\b/i.test(item)),
    workAuthorizationRequirement: requirements.find((item) => /\b(work authorization|work permit|eligible to work|citizen|visa)\b/i.test(item))
  };
}

function normalizedOpportunity(job: AdzunaJob, country: string, verifiedAt: string): Opportunity | null {
  const externalId = cleanText(String(job.id ?? ""));
  const title = cleanText(job.title);
  const description = cleanText(job.description);
  const applicationUrl = cleanText(job.redirect_url);
  if (!externalId || !title || !applicationUrl) return null;
  const employer = cleanText(job.company?.display_name) || "Employer not listed";
  const location = cleanText(job.location?.display_name) || cleanText(job.location?.area?.join(", ")) || country.toUpperCase();
  const normalizedCategory = category(job);
  const normalizedMode = workMode(job);
  const signals = extractRequirementSignals(description);
  return {
    id: `adzuna:${country}:${externalId}`,
    source: "adzuna",
    externalId,
    title,
    employer,
    provider: employer,
    category: normalizedCategory,
    country: country.toUpperCase(),
    location,
    remoteType: remoteType(normalizedMode),
    mode: normalizedMode,
    employmentType: employmentType(job),
    level: "Intermediate",
    deadline: "Check advert",
    careerTags: [title, cleanText(job.category?.label)].filter(Boolean),
    skillTags: [],
    description,
    salaryMin: numberValue(job.salary_min),
    salaryMax: numberValue(job.salary_max),
    salaryCurrency: currencyForCountry(country),
    postedAt: cleanText(job.created) || undefined,
    closingAt: undefined,
    applicationUrl,
    sourceUrl: applicationUrl,
    status: "ACTIVE",
    lastVerifiedAt: verifiedAt,
    responsibilities: signals.responsibilities,
    requirements: signals.requirements,
    requiredSkills: signals.requiredSkills,
    preferredSkills: signals.preferredSkills,
    requiredEducation: signals.requiredEducation,
    preferredEducation: signals.preferredEducation,
    licences: signals.licences,
    certifications: signals.certifications,
    languages: signals.languages,
    workAuthorizationRequirement: signals.workAuthorizationRequirement,
    outcome: "Job application",
    fitReason: "Real vacancy from Adzuna. Review requirements and apply only when it fits your confirmed Professional Identity."
  };
}

export class AdzunaJobProvider implements JobProvider {
  readonly id = "adzuna";

  constructor(
    private readonly appId = process.env.ADZUNA_APP_ID,
    private readonly appKey = process.env.ADZUNA_APP_KEY,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async search(input: JobProviderSearchInput): Promise<JobProviderSearchResult> {
    if (!this.appId || !this.appKey) {
      return {
        opportunities: [],
        status: {
          status: "provider_unavailable",
          provider: this.id,
          message: "Adzuna is not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY on the server."
        }
      };
    }

    const country = countryCode(input.country);
    const page = Math.max(1, input.page ?? 1);
    const url = new URL(`${adzunaEndpointRoot}/${country}/search/${page}`);
    url.searchParams.set("app_id", this.appId);
    url.searchParams.set("app_key", this.appKey);
    url.searchParams.set("results_per_page", String(Math.max(1, Math.min(input.resultsPerPage ?? 20, 50))));
    url.searchParams.set("content-type", "application/json");
    const query = cleanText(input.query);
    const location = cleanText(input.location);
    if (query) url.searchParams.set("what", query);
    if (location) url.searchParams.set("where", location);

    try {
      const response = await this.fetcher(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) {
        return {
          opportunities: [],
          status: {
            status: "provider_unavailable",
            provider: this.id,
            message: `Adzuna returned ${response.status}. Try again later.`
          }
        };
      }
      const data = await response.json() as AdzunaSearchResponse;
      if (!data || !Array.isArray(data.results)) {
        return {
          opportunities: [],
          status: {
            status: "invalid_provider_response",
            provider: this.id,
            message: "Adzuna returned a response PATHZY could not read."
          }
        };
      }
      const verifiedAt = new Date().toISOString();
      const opportunities = data.results
        .map((job) => normalizedOpportunity(job, country, verifiedAt))
        .filter((job): job is Opportunity => Boolean(job));
      return {
        opportunities,
        status: opportunities.length
          ? { status: "available", provider: this.id }
          : { status: "no_jobs_found", provider: this.id, message: "No real jobs were found for this search. Try a broader role or location." }
      };
    } catch {
      return {
        opportunities: [],
        status: {
          status: "provider_unavailable",
          provider: this.id,
          message: "PATHZY could not reach Adzuna right now. Try again later."
        }
      };
    }
  }
}
