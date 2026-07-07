"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui";
import { downloadBlob, pathzyFilename, simplePdfDocument } from "@/components/professional-identity/document-downloads";

function buildPrep({ role, company, jobDescription, language }: { role: string; company: string; jobDescription: string; language: string }) {
  const target = company ? `${role} at ${company}` : role;
  const jdHint = jobDescription ? "Use the job description to connect your examples to the role requirements." : "Use your career plan, CV, and real projects to keep answers specific.";

  if (language === "french") {
    return `PREPARATION D'ENTRETIEN: ${target}

10 QUESTIONS PROBABLES
1. Parlez-moi de vous et de votre parcours.
2. Pourquoi ce poste vous interesse-t-il?
3. Quelles competences pouvez-vous apporter a ce role?
4. Decrivez un projet ou vous avez appris rapidement.
5. Comment gerez-vous une tache difficile?
6. Quelle est votre plus grande force pour ce poste?
7. Quelle competence devez-vous encore ameliorer?
8. Comment travaillez-vous en equipe?
9. Pourquoi devrions-nous considerer votre candidature?
10. Avez-vous des questions pour nous?

STRUCTURE STAR
Situation: Expliquez le contexte reel.
Task: Decrivez votre responsabilite.
Action: Montrez ce que vous avez fait.
Result: Partagez un resultat honnete ou ce que vous avez appris.

FORCES A METTRE EN AVANT
- Votre motivation pour ${role}
- Vos competences liees a PATHZY et a votre plan de carriere
- Vos projets reels, formations, benevolat ou experiences verifiables

POINTS A PREPARER
- Les competences manquantes
- Les exemples concrets
- La clarte sur votre objectif professionnel

CHECKLIST FINALE
- Relire le CV
- Preparer 2 projets reels a expliquer
- Preparer 3 questions pour l'employeur
- Verifier l'heure, le lien et la tenue
- ${jdHint}

PATHZY vous aide a mieux vous preparer, sans promettre le resultat de l'entretien.`;
  }

  return `INTERVIEW PRACTICE: ${target}

10 LIKELY INTERVIEW QUESTIONS
1. Tell me about yourself and your career direction.
2. Why are you interested in this role?
3. Which skills can you bring to this position?
4. Describe a project where you learned quickly.
5. How do you handle a difficult task?
6. What is your strongest fit for this role?
7. Which skill are you still improving?
8. How do you work in a team?
9. Why should we consider your application?
10. What questions do you have for us?

STAR ANSWER STRUCTURE
Situation: Give the real context.
Task: Explain your responsibility.
Action: Show what you did.
Result: Share an honest outcome or what you learned.

STRENGTHS TO HIGHLIGHT
- Your motivation for ${role}
- Skills from your PATHZY career plan
- Real projects, education, volunteering, or work experience

WEAKNESSES TO PREPARE FOR
- Missing skills
- Vague examples
- Unclear career goal

FINAL CHECKLIST
- Review your CV
- Prepare 2 real projects to explain
- Prepare 3 questions for the employer
- Check the time, link, and outfit
- ${jdHint}

PATHZY helps you prepare better. It does not promise interview success.`;
}

export function InterviewPrepClient() {
  const searchParams = useSearchParams();
  const [output, setOutput] = useState("");
  const [celebration, setCelebration] = useState("");
  const [prepId, setPrepId] = useState("");
  const [error, setError] = useState("");
  const [target, setTarget] = useState({ role: searchParams?.get("role") ?? "", company: searchParams?.get("company") ?? "", language: "english", jobDescription: "" });

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextTarget = {
      role: String(form.get("role") || "the role"),
      company: String(form.get("company") || ""),
      jobDescription: String(form.get("jobDescription") || ""),
      language: String(form.get("language") || "english")
    };
    const content = buildPrep(nextTarget);
    setTarget(nextTarget);
    setOutput(content);
    setCelebration("Great step. You are preparing better for interview conversations.");
    setError("");

    try {
      const response = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextTarget, content })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Your progress is safe. Please try again.");
      setPrepId(data.prep.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your progress is safe. Please try again.");
    }
  }

  function downloadText() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${target.role || "interview-prep"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    if (!output) return;
    downloadBlob(pathzyFilename("InterviewPrep", target.role || "interview-prep", "pdf"), "application/pdf", simplePdfDocument("Interview Practice", output));
  }

  async function markComplete() {
    if (!prepId) return;
    setError("");
    try {
      const response = await fetch("/api/interview-prep", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prepId, completed: true, content: output })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Your progress is safe. Please try again.");
      setCelebration("Interview practice completed. Your journey can now reflect this step.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your progress is safe. Please try again.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.42fr_1fr]">
      <Card>
        <h2 className="text-2xl font-black">Prepare for an interview</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">Generate a focused practice plan using the role, company, and optional job description.</p>
        <form onSubmit={generate} className="mt-5 grid gap-4">
          <label className="label">Role<input className="field" name="role" defaultValue={target.role} placeholder="Junior Data Analyst" required /></label>
          <label className="label">Company optional<input className="field" name="company" defaultValue={target.company} placeholder="Company name" /></label>
          <label className="label">
            Language
            <select className="field" name="language" defaultValue="english">
              <option value="english">English</option>
              <option value="french">French</option>
            </select>
          </label>
          <label className="label">Job description optional<textarea className="field" name="jobDescription" placeholder="Paste role requirements here" /></label>
          <button className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white">Generate prep plan</button>
        </form>
      </Card>

      <Card>
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Interview practice output</p>
        {celebration ? <p className="mt-5 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebration}</p> : null}
        {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        <textarea
          className="mt-5 min-h-[520px] w-full resize-y rounded-[22px] border border-white/10 bg-[#050816]/70 p-5 text-sm leading-7 text-white/76 outline-none focus:border-[#5B8CFF]/50"
          value={output || "Your interview questions, STAR structure, strengths, weaknesses, and checklist will appear here."}
          onChange={(event) => setOutput(event.target.value)}
          readOnly={!output}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:opacity-50">Copy</button>
          <button onClick={downloadPdf} disabled={!output} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:opacity-50">Download PDF</button>
          <button onClick={downloadText} disabled={!output} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:opacity-50">Download text</button>
          <button onClick={markComplete} disabled={!prepId} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">Mark completed</button>
        </div>
      </Card>
    </div>
  );
}
