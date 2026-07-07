import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";

const careerBank = {
  creative: {
    title: "UX/UI Designer",
    match: "94% fit",
    why: "You show creative problem-solving, interest in people, and a lifestyle goal that fits digital product work.",
    skills: ["Figma", "User research", "Wireframing", "Design systems", "Portfolio case studies"]
  },
  business: {
    title: "Digital Growth Marketer",
    match: "90% fit",
    why: "Your interests point toward communication, income growth, and practical business outcomes.",
    skills: ["Copywriting", "Analytics", "SEO", "Paid ads", "Content strategy"]
  },
  technical: {
    title: "Junior Data Analyst",
    match: "88% fit",
    why: "Your strengths suggest pattern recognition, structured thinking, and a clear path toward stable opportunity.",
    skills: ["Excel", "SQL", "Dashboards", "Data cleaning", "Insight writing"]
  },
  builder: {
    title: "No-Code Product Builder",
    match: "86% fit",
    why: "Your answers show independence, curiosity, and a desire to turn ideas into useful products quickly.",
    skills: ["No-code tools", "Product thinking", "Landing pages", "Automation", "Customer interviews"]
  },
  people: {
    title: "Customer Success Specialist",
    match: "84% fit",
    why: "Your profile suggests communication, empathy, and a work style suited to helping people succeed.",
    skills: ["Communication", "CRM tools", "Problem solving", "Product knowledge", "Account management"]
  }
} as const;

function includesAny(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

export function generateMockRoadmap(answers: DiscoveryAnswers): GeneratedRoadmap {
  const combined = Object.values(answers).join(" ");
  const selected = [];

  if (includesAny(combined, ["design", "creative", "art", "visual", "figma", "media"])) selected.push(careerBank.creative);
  if (includesAny(combined, ["business", "sales", "marketing", "content", "brand", "money"])) selected.push(careerBank.business);
  if (includesAny(combined, ["data", "math", "excel", "coding", "software", "technology", "tech"])) selected.push(careerBank.technical);
  if (includesAny(combined, ["entrepreneur", "startup", "freelance", "remote", "freedom", "side hustle"])) selected.push(careerBank.builder);
  if (includesAny(combined, ["people", "help", "teaching", "support", "community", "mentor"])) selected.push(careerBank.people);

  const career_paths = [...selected, careerBank.creative, careerBank.business, careerBank.technical]
    .filter((path, index, list) => list.findIndex((item) => item.title === path.title) === index)
    .slice(0, 3)
    .map((path) => ({
      title: path.title,
      fit_percentage: Number.parseInt(path.match, 10),
      match: path.match,
      why: path.why,
      skills: [...path.skills]
    }));

  const mainPath = career_paths[0];
  const firstSkill = mainPath.skills[0];

  return {
    career_paths,
    roadmap_90_days: [
      `Days 1-30: Learn ${firstSkill}, finish two beginner lessons, and write a simple career positioning statement.`,
      `Days 31-60: Build two small ${mainPath.title} proof-of-work projects and publish them in a simple portfolio.`,
      "Days 61-90: Improve your CV, practice interviews, and apply to 25 roles, internships, scholarships, or freelance opportunities."
    ],
    today_first_mission: `Spend 30 minutes learning ${firstSkill}, then write one paragraph explaining what you learned and why it matters.`
  };
}
