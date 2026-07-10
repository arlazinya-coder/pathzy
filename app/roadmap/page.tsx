import { Badge, ButtonLink, Card, ProgressBar } from "@/components/ui";
import { SkillGapSummary } from "@/components/brain/skill-gap-summary";
import { SelectCareerButton } from "@/components/roadmap/select-career-button";
import type { CareerPathResult, GeneratedRoadmap } from "@/lib/discovery/types";
import { appRoutes } from "@/lib/navigation/routes";
import { calculateEmploymentReadiness, updatePathzyBrain } from "@/lib/pathzy-brain/brain-service";
import { roadmapPaths } from "@/lib/pathzy-data";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

const monthly = [
  "Month 1: Choose a path, learn fundamentals, and complete three guided exercises.",
  "Month 2: Build two portfolio projects and publish your first proof of work.",
  "Month 3: Apply to 25 opportunities, practice interviews, and improve your CV weekly."
];

type CareerMission = {
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  readinessGain: number;
};

type PlanTask = CareerMission & {
  week: number;
  status: "completed" | "current" | "upcoming";
};

const fallbackRoadmap: GeneratedRoadmap = {
  career_paths: roadmapPaths.map((path) => ({
    title: path.title,
    fit_percentage: Number.parseInt(path.match, 10),
    match: path.match,
    why: path.why,
    skills: [...path.skills]
  })),
  roadmap_90_days: monthly,
  today_first_mission: "Complete Discovery to create a personalized first step."
};

function isGeneratedRoadmap(value: unknown): value is GeneratedRoadmap {
  if (!value || typeof value !== "object") return false;
  const roadmap = value as Partial<GeneratedRoadmap>;
  return (
    Array.isArray(roadmap.career_paths) &&
    roadmap.career_paths.every((path) => typeof path.fit_percentage === "number" && typeof path.match === "string") &&
    Array.isArray(roadmap.roadmap_90_days) &&
    typeof roadmap.today_first_mission === "string"
  );
}

function skillAt(path: CareerPathResult | undefined, index: number, fallback: string) {
  return path?.skills?.[index] || fallback;
}

function firstMissionForCareer(path: CareerPathResult | undefined): CareerMission {
  const career = path?.title || "your chosen career";
  const firstSkill = skillAt(path, 0, career);

  return {
    title: `Complete ${firstSkill} fundamentals`,
    description: `Start your ${career} plan with one focused learning step today.`,
    estimatedTime: "20 minutes",
    difficulty: "Easy",
    xp: 40,
    readinessGain: 5
  };
}

function buildNinetyDayPlan(path: CareerPathResult | undefined, careerSelected: boolean, discoveryComplete: boolean): PlanTask[] {
  const career = path?.title || "Career direction";
  const firstSkill = skillAt(path, 0, "career fundamentals");
  const secondSkill = skillAt(path, 1, "workplace communication");
  const thirdSkill = skillAt(path, 2, "portfolio basics");
  const tasks: Array<Omit<PlanTask, "status">> = [
    {
      week: 1,
      title: discoveryComplete ? "Confirm your career direction" : "Complete Discovery",
      description: discoveryComplete ? `Choose ${career} or another path that feels right for your goals.` : "Finish Discovery so PATHZY can personalize your plan.",
      estimatedTime: "15 minutes",
      difficulty: "Easy",
      xp: 40,
      readinessGain: 5
    },
    {
      week: 2,
      title: `Learn ${firstSkill} fundamentals`,
      description: "Complete one beginner lesson and write down three things you learned.",
      estimatedTime: "25 minutes",
      difficulty: "Easy",
      xp: 40,
      readinessGain: 5
    },
    {
      week: 3,
      title: `Practice ${secondSkill}`,
      description: "Use one short exercise or project to turn learning into proof of work.",
      estimatedTime: "30 minutes",
      difficulty: "Medium",
      xp: 50,
      readinessGain: 6
    },
    {
      week: 4,
      title: "Create your focused CV",
      description: `Build a CV that presents you clearly for ${career}.`,
      estimatedTime: "30 minutes",
      difficulty: "Medium",
      xp: 75,
      readinessGain: 8
    },
    {
      week: 5,
      title: `Build a mini ${career} portfolio piece`,
      description: `Create one simple project that proves you can do the basics of ${career}.`,
      estimatedTime: "45 minutes",
      difficulty: "Medium",
      xp: 60,
      readinessGain: 7
    },
    {
      week: 6,
      title: "Improve your LinkedIn profile",
      description: "Update your headline, about section, skills, and featured work.",
      estimatedTime: "25 minutes",
      difficulty: "Easy",
      xp: 50,
      readinessGain: 6
    },
    {
      week: 7,
      title: "Create your Career Passport",
      description: "Bring your goal, strengths, documents, and readiness into one shareable summary.",
      estimatedTime: "25 minutes",
      difficulty: "Easy",
      xp: 55,
      readinessGain: 6
    },
    {
      week: 8,
      title: "Save three matching opportunities",
      description: `Find jobs, internships, courses, or scholarships connected to ${career}.`,
      estimatedTime: "20 minutes",
      difficulty: "Easy",
      xp: 45,
      readinessGain: 5
    },
    {
      week: 9,
      title: "Prepare your first application",
      description: "Match your CV and cover letter to one real opportunity.",
      estimatedTime: "30 minutes",
      difficulty: "Medium",
      xp: 55,
      readinessGain: 7
    },
    {
      week: 10,
      title: "Practice interview answers",
      description: `Prepare your story, strengths, and examples for ${career} interviews.`,
      estimatedTime: "30 minutes",
      difficulty: "Medium",
      xp: 60,
      readinessGain: 7
    },
    {
      week: 11,
      title: `Close your ${thirdSkill} gap`,
      description: "Strengthen one skill that will make your applications more convincing.",
      estimatedTime: "35 minutes",
      difficulty: "Medium",
      xp: 60,
      readinessGain: 6
    },
    {
      week: 12,
      title: "Review, apply, and improve",
      description: "Track applications, follow up, and adjust your plan based on real feedback.",
      estimatedTime: "40 minutes",
      difficulty: "Medium",
      xp: 70,
      readinessGain: 8
    }
  ];

  return tasks.map((task, index) => ({
    ...task,
    status: !careerSelected && index === 0 ? "current" : careerSelected && index === 0 ? "completed" : careerSelected && index === 1 ? "current" : "upcoming"
  }));
}

function salaryPlaceholder(path: CareerPathResult) {
  return `${path.title} salary guidance coming soon. PATHZY will personalize this by country as more market data is added.`;
}

function growthOutlook(path: CareerPathResult) {
  const mainSkill = path.skills[0] || "practical skills";
  return `Strong potential when you build visible proof of ${mainSkill} and apply consistently.`;
}

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const discoveryResult = user && supabase
    ? await supabase
      .from("discovery_responses")
      .select("generated_result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    : { data: null };
  const profileResult = user && supabase
    ? await supabase
      .from("user_profiles")
      .select("full_name,career_goal,preferred_path")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle()
    : { data: null };
  const levelResult = user && supabase
    ? await supabase
      .from("user_levels")
      .select("total_xp,level")
      .eq("user_id", user.id)
      .maybeSingle()
    : { data: null };
  const completedMissionResult = user && supabase
    ? await supabase
      .from("missions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
    : { count: 0 };
  const discovery = discoveryResult.data;
  const profile = profileResult.data;
  const level = levelResult.data;
  const completedMissionCount = completedMissionResult.count;
  const generatedRoadmap = isGeneratedRoadmap(discovery?.generated_result) ? discovery.generated_result : fallbackRoadmap;
  const hasPersonalizedRoadmap = Boolean(discovery?.generated_result);
  const careerOptions = generatedRoadmap.career_paths;
  const selectedCareerTitle = profile?.career_goal || profile?.preferred_path || "";
  const selectedCareer = careerOptions.find((path) => path.title === selectedCareerTitle);
  const recommendedCareer = careerOptions[0];
  const activeCareer = selectedCareer || recommendedCareer;
  const careerSelected = Boolean(selectedCareerTitle);
  const firstMission = firstMissionForCareer(activeCareer);
  const ninetyDayPlan = buildNinetyDayPlan(activeCareer, careerSelected, hasPersonalizedRoadmap);
  const currentTask = ninetyDayPlan.find((task) => task.status === "current") ?? ninetyDayPlan[0];
  const completedPlanTasks = ninetyDayPlan.filter((task) => task.status === "completed").length + (completedMissionCount ?? 0);
  const planProgress = Math.min(100, Math.round((completedPlanTasks / ninetyDayPlan.length) * 100));
  const estimatedCompletionDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const readiness = user && supabase
    ? await updatePathzyBrain(supabase, user.id, "Career plan refreshed").then(() => calculateEmploymentReadiness(supabase, user.id)).catch(() => null)
    : null;
  const rawName = typeof profile?.full_name === "string" && profile.full_name.trim()
    ? profile.full_name
    : typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === "string" && user.user_metadata.name.trim()
        ? user.user_metadata.name
        : "";
  const firstName = rawName.trim().split(/\s+/)[0] || "";

  return (
    <div className="container page-pad">
      <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/6 p-5 pb-24 shadow-[0_24px_80px_rgba(37,70,180,0.18)] sm:p-7 sm:pb-7 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#5B8CFF]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-[#9D7CFF]/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9db8ff]">WELCOME TO PATHZY</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              {firstName ? `Welcome, ${firstName}!` : "Welcome to PATHZY!"}
            </h1>
            <p className="mt-4 text-xl font-extrabold text-[#dfe8ff]">Let's build your future together.</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/68 sm:text-lg">
              You've taken the first step toward employment. Every action you complete brings you closer to interviews, job offers, and the career you deserve.
            </p>
          </div>
          <Card className="border-[#5B8CFF]/25 bg-[#5B8CFF]/10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#c7d6ff]">TODAY'S RECOMMENDATION</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white">Build your CV</h2>
              <p className="mt-3 text-sm leading-6 text-white/66 sm:text-base">
                A professional CV is the foundation of every successful job application.
              </p>
              <div className="mt-5">
                <ButtonLink href={appRoutes.professionalIdentityCv}>Build My CV</ButtonLink>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Card className="mb-6">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-center">
          <div>
            <Badge>{careerSelected ? "You are here" : "Next action"}</Badge>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">{careerSelected ? `Build toward ${selectedCareerTitle}` : "Choose your primary career goal"}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/66">
              {careerSelected
                ? `Your plan is active. Start with ${currentTask.title}, then PATHZY will guide you through documents, opportunities, applications, and interviews.`
                : "PATHZY recommends a direction, but you stay in control. Choose the path that feels right, compare the options, or ask the Mentor first."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={careerSelected ? "/missions" : "#career-options"}>{careerSelected ? "Start My 90-Day Plan" : "Choose a Career"}</ButtonLink>
              <ButtonLink href="/mentor?context=Career%20Plan%20page%20-%20help%20me%20choose%20a%20career" variant="secondary">Talk to Mentor</ButtonLink>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/7 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Plan progress</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <strong className="text-4xl">{planProgress}%</strong>
              <span className="pb-1 text-sm font-bold text-white/54">Employment readiness</span>
            </div>
            <div className="mt-4">
              <ProgressBar value={readiness?.totalScore ?? planProgress} />
            </div>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid gap-5 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Career selected</p>
          <p className="mt-3 text-xl font-black">{selectedCareerTitle || "Not chosen yet"}</p>
        </Card>
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Current week</p>
          <p className="mt-3 text-xl font-black">Week {currentTask.week}</p>
        </Card>
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">XP</p>
          <p className="mt-3 text-xl font-black">{level?.total_xp ?? 0} XP</p>
        </Card>
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Target date</p>
          <p className="mt-3 text-xl font-black">{estimatedCompletionDate}</p>
        </Card>
      </div>

      <div id="career-options" className="grid gap-5 lg:grid-cols-3">
        {careerOptions.map((path) => {
          const isSelected = selectedCareerTitle === path.title;
          return (
          <Card key={path.title}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-black">{path.title}</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-extrabold text-[#9db8ff]">{path.match || `${path.fit_percentage}% fit`}</span>
            </div>
            {isSelected ? <p className="mt-3 w-fit rounded-full border border-[#66E3B4]/30 bg-[#66E3B4]/14 px-3 py-2 text-xs font-extrabold text-[#d8fff0]">Primary Career Goal</p> : null}
            <p className="mt-4 leading-7 text-white/62">{path.why}</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Key strengths</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{path.skills.slice(0, 2).join(" and ") || "Curiosity and consistency"}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Estimated salary</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{salaryPlaceholder(path)}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Growth outlook</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{growthOutlook(path)}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {path.skills.map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-white/68">{skill}</span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <SelectCareerButton careerGoal={path.title} selected={isSelected} />
              <a href="#compare-careers" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Compare</a>
              <a href={`/mentor?context=${encodeURIComponent(`Explain the ${path.title} career path and what I should do next`)}`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Learn More</a>
            </div>
          </Card>
          );
        })}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <Badge>Your first mission</Badge>
          <div className="mt-5 rounded-[22px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">Career</p>
            <h2 className="mt-2 text-3xl font-black">{activeCareer?.title || "Choose your path"}</h2>
            <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">Today&apos;s mission</p>
            <p className="mt-2 text-xl font-black">{careerSelected ? firstMission.title : "Choose one career path to unlock your first mission."}</p>
            <p className="mt-3 leading-7 text-white/66">{careerSelected ? firstMission.description : "Once you choose, PATHZY will turn your career plan into a daily action."}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <p className="text-xs font-bold text-white/42">Estimated time</p>
                <p className="mt-1 font-black">{firstMission.estimatedTime}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <p className="text-xs font-bold text-white/42">Job Readiness</p>
                <p className="mt-1 font-black">+{firstMission.readinessGain}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <p className="text-xs font-bold text-white/42">XP</p>
                <p className="mt-1 font-black">+{firstMission.xp}</p>
              </div>
            </div>
            <div className="mt-5">
              <ButtonLink href={careerSelected ? "/missions" : "#career-options"}>{careerSelected ? "Start Mission" : "Choose Career First"}</ButtonLink>
            </div>
          </div>
        </Card>
        <Card>
          <Badge>Mentor explanation</Badge>
          <div className="mt-5 rounded-[20px] border border-white/10 bg-white/7 p-5">
            <p className="text-lg font-bold leading-8 text-white/78">
              Based on your answers, I recommend {recommendedCareer?.title || "this path"} because {recommendedCareer?.why || "it matches your interests and strengths"}. You are free to choose another path if it better reflects your goals.
            </p>
            <div className="mt-5">
              <ButtonLink href={`/mentor?context=${encodeURIComponent(`Explain why ${recommendedCareer?.title || "my recommended career"} fits me and what I should do next`)}`} variant="secondary">Ask Mentor to Explain</ButtonLink>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <Badge>Interactive 90-day plan</Badge>
          <div className="mt-5 grid gap-4">
            {ninetyDayPlan.map((task) => (
              <div key={`${task.week}-${task.title}`} className={`rounded-[18px] border p-4 ${task.status === "current" ? "border-[#5B8CFF]/35 bg-[#5B8CFF]/10" : task.status === "completed" ? "border-[#66E3B4]/28 bg-[#66E3B4]/10" : "border-white/10 bg-white/7"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Week {task.week}</p>
                    <h3 className="mt-2 text-xl font-black">{task.title}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-extrabold text-white/66">
                    {task.status === "completed" ? "Completed" : task.status === "current" ? "You are here" : "Next"}
                  </span>
                </div>
                <p className="mt-3 leading-7 text-white/62">{task.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/62">
                  <span className="rounded-full bg-white/8 px-3 py-2">{task.estimatedTime}</span>
                  <span className="rounded-full bg-white/8 px-3 py-2">{task.difficulty}</span>
                  <span className="rounded-full bg-white/8 px-3 py-2">+{task.xp} XP</span>
                  <span className="rounded-full bg-white/8 px-3 py-2">+{task.readinessGain} readiness</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Badge>Choose your next move</Badge>
          <div className="mt-5 grid gap-3">
            <ButtonLink href={careerSelected ? "/missions" : "#career-options"}>Start This Plan</ButtonLink>
            <ButtonLink href="#career-options" variant="secondary">Choose Another Career</ButtonLink>
            <ButtonLink href="#compare-careers" variant="secondary">Compare Careers</ButtonLink>
            <ButtonLink href="/professional-identity/cv" variant="secondary">Build My CV Instead</ButtonLink>
            <ButtonLink href="/skills" variant="secondary">Improve Skills First</ButtonLink>
            <ButtonLink href="/mentor?context=Career%20Plan%20page%20-%20help%20me%20decide%20my%20next%20step" variant="secondary">Talk to Mentor</ButtonLink>
          </div>
          {readiness?.skillGaps?.length ? (
            <div className="mt-5 rounded-[20px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-5">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">Skills and CV can move together</p>
              <p className="mt-2 leading-7 text-white/66">You can start your CV now and improve this skill at the same time.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="/skills" className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Improve skills first</a>
                <a href="/professional-identity/cv" className="rounded-full blue-purple px-4 py-2 text-sm font-extrabold text-white">Build CV now</a>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <div id="compare-careers" className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <Badge>Compare careers</Badge>
          <div className="mt-5 grid gap-4">
            {careerOptions.map((path) => (
              <div key={`compare-${path.title}`} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{path.title}</strong>
                  <span className="text-sm font-bold text-[#9db8ff]">{path.match || `${path.fit_percentage}% fit`}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/62">{path.skills.slice(0, 3).join(" | ")}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Badge>Original 90-day summary</Badge>
          <div className="mt-5 grid gap-4">
            {generatedRoadmap.roadmap_90_days.map((item, index) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
                <strong>0{index + 1}</strong>
                <p className="mt-2 text-white/66">{item}</p>
              </div>
            ))}
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
              <strong>Today</strong>
              <p className="mt-2 text-white/66">{generatedRoadmap.today_first_mission}</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-6">
        {readiness ? <SkillGapSummary skillGaps={readiness.skillGaps} /> : null}
      </div>
    </div>
  );
}
