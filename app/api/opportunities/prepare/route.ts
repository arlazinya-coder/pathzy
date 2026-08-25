import { NextResponse } from "next/server";
import { createJobImport, JobImportError, type JobImportPreliminaryDetails } from "@/lib/job-intelligence";
import { opportunityToJobImportText } from "@/lib/opportunities/matching";
import type { Opportunity } from "@/lib/opportunities/types";
import { routeBuilders } from "@/lib/navigation/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isOpportunity(value: unknown): value is Opportunity {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Boolean(
    cleanText(record.id) &&
      cleanText(record.source) &&
      cleanText(record.externalId) &&
      cleanText(record.title) &&
      cleanText(record.employer) &&
      cleanText(record.applicationUrl)
  );
}

function opportunityDetails(opportunity: Opportunity): JobImportPreliminaryDetails {
  return {
    jobTitle: opportunity.title,
    organisation: opportunity.employer,
    location: opportunity.location,
    employmentType: opportunity.employmentType,
    workArrangement: opportunity.remoteType,
    closingDate: opportunity.closingAt,
    applicationInstructions: opportunity.applicationUrl
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "You must be logged in to prepare an application." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { opportunity?: unknown };
  if (!isOpportunity(body.opportunity)) {
    return NextResponse.json({ error: "A real normalized opportunity is required." }, { status: 400 });
  }

  const opportunity = body.opportunity;
  if (opportunity.source === "pathzy_static_catalog") {
    return NextResponse.json({ error: "Only real or verified opportunities can be used for application preparation." }, { status: 400 });
  }

  try {
    const jobImport = await createJobImport(supabase, user.id, {
      sourceType: "existing_opportunity",
      opportunityId: opportunity.id,
      rawText: opportunityToJobImportText(opportunity),
      sourceUrl: opportunity.sourceUrl || opportunity.applicationUrl,
      details: opportunityDetails(opportunity)
    });

    return NextResponse.json({
      jobImport,
      coverLetterUrl: routeBuilders.coverLetterWorkspace({ jobId: jobImport.id })
    });
  } catch (caught) {
    if (caught instanceof JobImportError) {
      return NextResponse.json({ error: caught.userMessage }, { status: caught.status });
    }
    return NextResponse.json({ error: "PATHZY could not prepare this opportunity yet." }, { status: 500 });
  }
}
