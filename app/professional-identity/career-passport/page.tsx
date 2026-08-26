import Link from "next/link";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";
import { buildCareerPassportProjection, type CareerPassportProjection } from "@/lib/professional-identity/career-passport-projection";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { createCurrentProfessionalPhotoView } from "@/lib/professional-identity/professional-photo";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function readinessTone(status: string) {
  if (status === "Ready" || status === "Ready to start") return "bg-[#ecfdf5] text-[#166534] border-[#bbf7d0]";
  if (status === "In progress") return "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]";
  if (status === "Needs strengthening") return "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]";
  return "bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]";
}

function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4">
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]">{eyebrow}</p> : null}
      <h2 className="mt-1 text-2xl font-black tracking-normal text-[#111827]">{title}</h2>
      {children ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4b5563]">{children}</p> : null}
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[18px] border border-dashed border-[#d1d5db] bg-[#f9fafb] px-4 py-3 text-sm font-semibold text-[#6b7280]">{children}</p>;
}

function EvidenceList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
      <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="text-sm font-semibold leading-6 text-[#111827]">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm font-semibold text-[#6b7280]">{empty}</p>
      )}
    </div>
  );
}

function ProfessionalSnapshot({ projection, photoUrl }: { projection: CareerPassportProjection; photoUrl: string | null | undefined }) {
  return (
    <Card className="bg-[#f7f2eb]">
      <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
        <div className="h-28 w-28 overflow-hidden rounded-[28px] border border-[#e7d8ca] bg-white shadow-sm">
          {photoUrl ? (
            // Signed private Supabase photo URLs should render directly without Next image remote-domain coupling.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={`${projection.snapshot.name} professional photo`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[#7f1d1d]">
              {projection.snapshot.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <Badge>CAREER PASSPORT</Badge>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-[#111827] md:text-5xl">{projection.snapshot.name}</h1>
          <p className="mt-2 text-xl font-extrabold text-[#3f1118]">{projection.snapshot.title}</p>
          <p className="mt-1 text-sm font-semibold text-[#6b7280]">{projection.snapshot.location}</p>
          <div className="mt-5 rounded-[22px] border border-[#eadfd4] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Career direction</p>
            <p className="mt-2 text-lg font-bold leading-7 text-[#111827]">{projection.snapshot.careerDirection}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReadinessSection({ projection }: { projection: CareerPassportProjection }) {
  return (
    <Card className="bg-[#fbfaf7]">
      <SectionHeading title="My Readiness">
        Simple readiness states based on your current PATHZY information and saved employment documents.
      </SectionHeading>
      <div className="grid gap-3">
        {projection.readiness.map((item) => (
          <div key={item.label} className="grid gap-3 rounded-[20px] border border-[#e5e7eb] bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="text-base font-black text-[#111827]">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-[#6b7280]">{item.detail}</p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${readinessTone(item.status)}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EvidenceSection({ projection }: { projection: CareerPassportProjection }) {
  return (
    <Card className="bg-[#fbfaf7]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading title="My Evidence">
          Compact proof from your Professional Identity and saved employment documents. This is not your full CV.
        </SectionHeading>
        <ButtonLink href={appRoutes.documents} variant="secondary">View supporting documents</ButtonLink>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Experience</h3>
          {projection.evidence.experience.length ? (
            <div className="mt-4 space-y-4">
              {projection.evidence.experience.map((entry) => (
                <div key={`${entry.role}-${entry.company}-${entry.dates}`} className="border-b border-[#f3f4f6] pb-4 last:border-b-0 last:pb-0">
                  <p className="text-base font-black text-[#111827]">{entry.role || "Experience"}</p>
                  {entry.company ? <p className="text-sm font-bold text-[#4b5563]">{entry.company}</p> : null}
                  {entry.dates || entry.location ? <p className="mt-1 text-xs font-semibold text-[#6b7280]">{[entry.dates, entry.location].filter(Boolean).join(" · ")}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-[#6b7280]">No experience added yet.</p>
          )}
        </div>
        <EvidenceList title="Education" items={projection.evidence.education} empty="No education added yet." />
        <EvidenceList title="Projects" items={projection.evidence.projects} empty="You have not added project evidence yet." />
        <EvidenceList title="Achievements" items={projection.evidence.achievements} empty="No achievement added yet." />
        <EvidenceList title="Certificates" items={projection.evidence.certificates} empty="No certificate added yet." />
        <EvidenceList title="Licences" items={projection.evidence.licences} empty="No licence added yet." />
      </div>
    </Card>
  );
}

export default async function CareerPassportPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/career-passport");
  const [identityReadModel, documentsResult] = await Promise.all([
    getProfessionalIdentityReadModelSafe(supabase, user, "career passport professional identity"),
    supabase
      .from("user_documents")
      .select("document_type,status,content_json,updated_at")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
  ]);
  const canonicalProfessionalPhoto = await createCurrentProfessionalPhotoView(supabase, identityReadModel.values.professional_photo_asset, { userId: user.id, expiresIn: 600 });
  const projection = buildCareerPassportProjection({
    values: identityReadModel.values,
    completion: identityReadModel.completion,
    documents: (documentsResult.data ?? []).map((row) => {
      const contentJson = row.content_json && typeof row.content_json === "object" ? row.content_json as Record<string, unknown> : {};
      return {
        documentType: String(row.document_type ?? ""),
        status: typeof row.status === "string" ? row.status : null,
        category: typeof contentJson.vault_category === "string" ? contentJson.vault_category : null,
        updatedAt: typeof row.updated_at === "string" ? row.updated_at : null
      };
    }),
    updatedAt: identityReadModel.profile?.updated_at ?? null
  });

  const updatedDate = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(projection.updatedAt));

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Career Passport">
        A living view of what your Professional Identity means for your employment journey right now.
      </PageHeader>

      <div className="grid gap-6">
        <ProfessionalSnapshot projection={projection} photoUrl={canonicalProfessionalPhoto?.signedUrl} />

        <Card className="bg-[#fbfaf7]">
          <SectionHeading title="Where I'm Going" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Your Goal</p>
              <p className="mt-2 text-lg font-bold leading-7 text-[#111827]">{projection.going.goal}</p>
            </div>
            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Primary focus</p>
              <p className="mt-2 text-lg font-bold leading-7 text-[#111827]">{projection.going.primaryFocus}</p>
            </div>
            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Near-reach roles</p>
              <ul className="mt-3 space-y-2">
                {projection.going.nearReachRoles.map((role) => <li key={role} className="text-sm font-semibold text-[#111827]">{role}</li>)}
              </ul>
            </div>
            <div className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Longer-term direction</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#111827]">{projection.going.longerTermDirection}</p>
            </div>
          </div>
        </Card>

        <ReadinessSection projection={projection} />

        <Card className="bg-[#f7f2eb]">
          <SectionHeading title="What Is Holding Me Back?" />
          <p className="max-w-3xl text-base font-semibold leading-7 text-[#111827]">{projection.barrier}</p>
        </Card>

        <Card className="bg-[#fbfaf7]">
          <SectionHeading title="What I Can Offer" />
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Core skills</h3>
          {projection.offer.coreSkills.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {projection.offer.coreSkills.map((skill) => (
                <span key={skill} className="rounded-full border border-[#eadfd4] bg-white px-4 py-2 text-sm font-black text-[#111827]">{skill}</span>
              ))}
            </div>
          ) : (
            <EmptyText>{projection.offer.emptyState}</EmptyText>
          )}
        </Card>

        <Card className="bg-[#fbfaf7]">
          <SectionHeading title="My Strengths" />
          {projection.strengths.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projection.strengths.map((strength) => (
                <div key={strength.title} className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
                  <h3 className="text-lg font-black text-[#111827]">{strength.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">{strength.evidence}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyText>Add skills, experience, projects, or achievements so PATHZY can identify supported strengths.</EmptyText>
          )}
        </Card>

        <EvidenceSection projection={projection} />

        <Card className="bg-[#fbfaf7]">
          <SectionHeading title="Achievements & Progress" />
          <div className="grid gap-3 md:grid-cols-2">
            {projection.milestones.map((milestone) => (
              <div key={milestone.label} className="flex items-center gap-3 rounded-[18px] border border-[#e5e7eb] bg-white p-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${milestone.complete ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
                  {milestone.complete ? "✓" : "○"}
                </span>
                <p className="text-sm font-bold text-[#111827]">{milestone.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#fbfaf7]">
          <SectionHeading title="Career Focus" />
          {projection.careerFocus.length ? (
            <div className="grid gap-4">
              {projection.careerFocus.map((focus, index) => (
                <div key={`${focus.title}-${index}`} className="rounded-[22px] border border-[#e5e7eb] bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">{index + 1}</p>
                  <h3 className="mt-1 text-lg font-black text-[#111827]">{focus.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4b5563]">{focus.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyText>Add a career goal or preferred roles to see your current focus directions.</EmptyText>
          )}
        </Card>

        <Card className="bg-[#3f1118] text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f7d7d9]">Your Next Best Action</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal text-white">{projection.nextBestAction.title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f7d7d9]">Why?</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">{projection.nextBestAction.why}</p>
            </div>
            <div className="rounded-[22px] border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f7d7d9]">Next step</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">{projection.nextBestAction.nextStep}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link href={projection.nextBestAction.href} className="pathzy-button-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-black">
              {projection.nextBestAction.label}
            </Link>
          </div>
        </Card>

        <p className="text-center text-sm font-semibold text-[var(--text-secondary)]">Career Passport updated: {updatedDate}</p>
      </div>
    </div>
  );
}
