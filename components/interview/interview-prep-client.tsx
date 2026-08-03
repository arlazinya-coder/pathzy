"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { downloadBlob, pathzyFilename, simplePdfDocument } from "@/components/professional-identity/document-downloads";
import { appRoutes } from "@/lib/navigation/routes";
import type { EmployerQuestion, GapResponse, InterviewFeedback, InterviewPrepQuestion, InterviewPrepRecord, InterviewType, StarStory } from "@/lib/interview/interview-prep.types";

type ApplicationOption = {
  id: string;
  company_name: string;
  role: string;
  status: string;
  job_understanding_id?: string | null;
  job_match_analysis_id?: string | null;
  targeted_cv_document_id?: string | null;
  interview_date?: string | null;
};

const interviewTypes: InterviewType[] = ["screening", "behavioural", "technical", "panel", "case_study", "presentation", "final", "unknown"];

function label(value: string) {
  return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function structuredText(prep: InterviewPrepRecord) {
  return [
    `Interview Preparation: ${prep.role}${prep.company ? ` at ${prep.company}` : ""}`,
    `Interview type: ${label(prep.interviewType)}`,
    "",
    "Practice Questions",
    ...prep.questions.map((question, index) => `${index + 1}. ${question.question}\nWhy: ${question.whyAsked}\nEvidence to use: ${question.evidenceToUse.map((item) => item.label).join(", ") || "Confirm evidence first."}\nClaims to avoid: ${question.claimsToAvoid.join("; ")}`),
    "",
    "STAR Stories",
    ...prep.starStories.map((story) => `${story.title}\nSituation: ${story.situation}\nTask: ${story.task}\nAction: ${story.action}\nResult: ${story.result}`),
    "",
    "Gap Responses",
    ...prep.gapResponses.map((gap) => `${gap.gap}\n${gap.honestPositioning}`),
    "",
    "Questions for the Employer",
    ...prep.employerQuestions.map((item) => `- ${item.question}`)
  ].join("\n\n");
}

function QuestionCard({
  question,
  feedback,
  onPractice
}: {
  question: InterviewPrepQuestion;
  feedback?: InterviewFeedback;
  onPractice: (question: InterviewPrepQuestion) => void;
}) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-white/7 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/70">{label(question.category)}</p>
          <h3 className="mt-2 text-lg font-black">{question.question}</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/58">{label(question.source)}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/58">{question.whyAsked}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Evidence to Use</p>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/60">
            {question.evidenceToUse.length ? question.evidenceToUse.map((item) => <li key={`${question.id}-${item.canonicalEntityId}`}>{item.label}: {item.evidenceText}</li>) : <li>Confirm evidence in your Professional Identity before relying on this answer.</li>}
          </ul>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Claims to Avoid</p>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/60">
            {question.claimsToAvoid.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-4 rounded-[16px] border border-white/10 bg-black/14 p-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Answer Structure</p>
        <p className="mt-2 text-sm leading-6 text-white/60">{question.answerStructure.join(" -> ")}</p>
      </div>
      {feedback ? (
        <div className="mt-4 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-3 text-sm leading-6 text-[#b9f8d5]">
          <strong>Feedback:</strong> Relevance {feedback.relevance}/100, clarity {feedback.clarity}/100, evidence use {feedback.evidenceUse}/100.
          {feedback.unsupportedClaims.length ? <span className="block text-[#ffc5c5]">Review: {feedback.unsupportedClaims.join(" ")}</span> : null}
        </div>
      ) : null}
      <button onClick={() => onPractice(question)} className="mt-4 rounded-full blue-purple px-4 py-2 text-sm font-extrabold text-white">Practice Answer</button>
    </article>
  );
}

function StarStories({ stories }: { stories: StarStory[] }) {
  return (
    <div className="grid gap-3">
      {stories.map((story) => (
        <article key={story.id} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
          <h3 className="text-lg font-black">{story.title}</h3>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-white/60">
            <p><strong className="text-white/78">Situation:</strong> {story.situation}</p>
            <p><strong className="text-white/78">Task:</strong> {story.task}</p>
            <p><strong className="text-white/78">Action:</strong> {story.action}</p>
            <p><strong className="text-white/78">Result:</strong> {story.result}</p>
          </div>
          <p className="mt-3 text-xs font-bold text-white/42">Evidence entities: {story.sourceCanonicalEntityIds.join(", ") || "Confirm evidence first"}</p>
        </article>
      ))}
    </div>
  );
}

function GapResponses({ gaps }: { gaps: GapResponse[] }) {
  return (
    <div className="grid gap-3">
      {gaps.map((gap) => (
        <article key={gap.id} className="rounded-[18px] border border-[#FFD166]/25 bg-[#FFD166]/8 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffe2a3]/70">{label(gap.type)}</p>
          <h3 className="mt-2 text-lg font-black">{gap.gap}</h3>
          <p className="mt-2 text-sm leading-6 text-white/62">{gap.honestPositioning}</p>
          <p className="mt-3 text-xs font-bold text-white/42">Avoid: {gap.claimsToAvoid.join("; ")}</p>
        </article>
      ))}
    </div>
  );
}

function EmployerQuestions({ questions }: { questions: EmployerQuestion[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {questions.map((item) => (
        <article key={item.id} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{label(item.category)}</p>
          <h3 className="mt-2 text-base font-black">{item.question}</h3>
          <p className="mt-2 text-sm leading-6 text-white/56">{item.rationale}</p>
        </article>
      ))}
    </div>
  );
}

export function InterviewPrepClient({ applications }: { applications: ApplicationOption[] }) {
  const searchParams = useSearchParams();
  const initialApplicationId = searchParams?.get("applicationId") ?? applications[0]?.id ?? "";
  const [selectedApplicationId, setSelectedApplicationId] = useState(initialApplicationId);
  const [interviewType, setInterviewType] = useState<InterviewType>("unknown");
  const [language, setLanguage] = useState<"english" | "french">("english");
  const [prep, setPrep] = useState<InterviewPrepRecord | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<InterviewPrepQuestion | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceNotes, setPracticeNotes] = useState("");
  const [selfRating, setSelfRating] = useState("3");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const selectedApplication = useMemo(() => applications.find((application) => application.id === selectedApplicationId), [applications, selectedApplicationId]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedApplicationId) return;
    setBusy("generate");
    setError("");
    try {
      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedApplicationId, interviewType, language })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create interview preparation.");
      setPrep(data.prep);
      setActiveQuestion(data.prep.questions?.[0] ?? null);
      setPracticeAnswer("");
      setSelectedEvidence([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create interview preparation.");
    } finally {
      setBusy("");
    }
  }

  async function savePractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prep || !activeQuestion) return;
    setBusy("practice");
    setError("");
    try {
      const response = await fetch("/api/interview-prep", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prep.id,
          questionId: activeQuestion.id,
          answer: practiceAnswer,
          notes: practiceNotes,
          selfRating: Number(selfRating),
          evidenceChecklist: selectedEvidence
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save practice answer.");
      setPrep(data.prep);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save practice answer.");
    } finally {
      setBusy("");
    }
  }

  async function markComplete() {
    if (!prep) return;
    setBusy("complete");
    setError("");
    try {
      const response = await fetch("/api/interview-prep", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prep.id, completed: true, content: structuredText(prep) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not mark interview prep complete.");
      setPrep((current) => current ? { ...current, completed: true, status: "completed" } : current);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not mark interview prep complete.");
    } finally {
      setBusy("");
    }
  }

  function toggleEvidence(labelValue: string) {
    setSelectedEvidence((current) => current.includes(labelValue) ? current.filter((item) => item !== labelValue) : [...current, labelValue]);
  }

  function downloadPdf() {
    if (!prep) return;
    downloadBlob(pathzyFilename("InterviewPrep", prep.role || "interview-prep", "pdf"), "application/pdf", simplePdfDocument("Interview Preparation", structuredText(prep)));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.34fr_1fr]">
      <div className="grid gap-5">
        <Card>
          <h2 className="text-2xl font-black">Interview Preparation</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">Create job-specific practice from your tracked application, confirmed Professional Identity, job match, gaps, and targeted CV.</p>
          {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
          {applications.length ? (
            <form onSubmit={generate} className="mt-5 grid gap-4">
              <label className="label">
                Application
                <select className="field" value={selectedApplicationId} onChange={(event) => setSelectedApplicationId(event.target.value)} required>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>{application.role} - {application.company_name}</option>
                  ))}
                </select>
              </label>
              <label className="label">
                Interview type
                <select className="field" value={interviewType} onChange={(event) => setInterviewType(event.target.value as InterviewType)}>
                  {interviewTypes.map((type) => <option key={type} value={type}>{label(type)}</option>)}
                </select>
              </label>
              <label className="label">
                Language
                <select className="field" value={language} onChange={(event) => setLanguage(event.target.value as "english" | "french")}>
                  <option value="english">English</option>
                  <option value="french">French</option>
                </select>
              </label>
              {selectedApplication && !selectedApplication.job_match_analysis_id ? (
                <p className="rounded-[16px] border border-[#FFD166]/30 bg-[#FFD166]/10 p-3 text-sm font-bold text-[#ffe2a3]">This application needs Job Intelligence before PATHZY can create evidence-grounded interview prep.</p>
              ) : null}
              <button disabled={busy === "generate" || !selectedApplication?.job_match_analysis_id} className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">
                {busy === "generate" ? "Preparing" : "Create Interview Prep"}
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-[18px] border border-dashed border-white/14 bg-white/5 p-5">
              <h3 className="text-lg font-black">Track an application first.</h3>
              <p className="mt-2 text-sm leading-6 text-white/56">Interview preparation is strongest after Job Intelligence has matched a real opportunity to your Professional Identity.</p>
              <Link href={appRoutes.applications} className="mt-4 inline-flex rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white">Go to Applications</Link>
            </div>
          )}
        </Card>

        {prep ? (
          <Card>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Practice Answer</p>
            {activeQuestion ? (
              <form onSubmit={savePractice} className="mt-4 grid gap-4">
                <h3 className="text-lg font-black">{activeQuestion.question}</h3>
                <label className="label">Practice Answer<textarea className="field min-h-[180px]" value={practiceAnswer} onChange={(event) => setPracticeAnswer(event.target.value)} /></label>
                <label className="label">Notes<textarea className="field" value={practiceNotes} onChange={(event) => setPracticeNotes(event.target.value)} /></label>
                <label className="label">Self-rating<select className="field" value={selfRating} onChange={(event) => setSelfRating(event.target.value)}><option value="1">1 - Needs work</option><option value="2">2</option><option value="3">3 - Getting there</option><option value="4">4</option><option value="5">5 - Strong</option></select></label>
                <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Evidence checklist</p>
                  <div className="mt-2 grid gap-2">
                    {activeQuestion.evidenceToUse.map((item) => (
                      <label key={item.canonicalEntityId} className="flex items-start gap-3 text-sm leading-6 text-white/62">
                        <input className="mt-1" type="checkbox" checked={selectedEvidence.includes(item.label)} onChange={() => toggleEvidence(item.label)} />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button disabled={busy === "practice"} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{busy === "practice" ? "Saving" : "Save Practice"}</button>
              </form>
            ) : null}
          </Card>
        ) : null}
      </div>

      <div className="grid gap-5">
        {prep ? (
          <>
            <Card>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Interview Preparation</p>
                  <h2 className="mt-2 text-3xl font-black">{prep.role}{prep.company ? ` at ${prep.company}` : ""}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/58">Grounded in the tracked application, job requirements, match analysis, targeted CV, and confirmed Professional Identity evidence.</p>
                </div>
                <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/62">{label(prep.interviewType)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={downloadPdf} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Download PDF</button>
                <button onClick={() => navigator.clipboard.writeText(structuredText(prep))} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Copy Prep</button>
                <button onClick={markComplete} disabled={busy === "complete"} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{prep.completed ? "Completed" : "Mark Completed"}</button>
              </div>
            </Card>

            <Card>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Practice Questions</p>
              <div className="mt-5 grid gap-4">
                {prep.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    feedback={prep.feedback.find((item) => item.questionId === question.id)}
                    onPractice={(item) => {
                      setActiveQuestion(item);
                      const existing = prep.practiceResponses.find((response) => response.questionId === item.id);
                      setPracticeAnswer(existing?.answer ?? "");
                      setPracticeNotes(existing?.notes ?? "");
                      setSelfRating(String(existing?.selfRating ?? 3));
                      setSelectedEvidence(existing?.evidenceChecklist ?? []);
                    }}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">STAR Stories</p>
              <div className="mt-5"><StarStories stories={prep.starStories} /></div>
            </Card>

            <Card>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Gap Responses</p>
              <div className="mt-5"><GapResponses gaps={prep.gapResponses} /></div>
            </Card>

            <Card>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Questions for the Employer</p>
              <div className="mt-5"><EmployerQuestions questions={prep.employerQuestions} /></div>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Ready when your application is ready</p>
            <h2 className="mt-2 text-3xl font-black">Choose one tracked application to begin.</h2>
            <p className="mt-3 leading-7 text-white/58">PATHZY will avoid generic lists and prepare questions from the real job responsibilities, requirements, match evidence, gaps, and targeted CV claims.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
