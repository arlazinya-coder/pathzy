import type { DiscoveryAnswers } from "@/lib/discovery/types";
import type { GeneratedRoadmap } from "@/lib/discovery/types";
import type { Opportunity, OpportunityAction, OpportunityStats, PersonalizedOpportunity } from "@/lib/opportunities/types";

export const opportunityCatalog: Opportunity[] = [
  {
    id: "ux-junior-product-designer-remote",
    title: "Junior Product Designer Talent Pool",
    provider: "Remote startup network",
    category: "Recommended jobs",
    country: "Global",
    mode: "Remote",
    level: "Early career",
    deadline: "Rolling",
    careerTags: ["UX/UI Designer", "Product Designer", "UI Designer"],
    skillTags: ["Figma", "User research", "Wireframes", "Portfolio storytelling"],
    description: "Entry-level product design roles for candidates with a small portfolio and strong user empathy.",
    outcome: "Paid junior role",
    fitReason: "Strong match for design career plans, visual thinking, and portfolio-based career growth."
  },
  {
    id: "digital-marketing-assistant-remote",
    title: "Remote Digital Marketing Assistant",
    provider: "Growth agency partner board",
    category: "Recommended jobs",
    country: "Global",
    mode: "Remote",
    level: "Beginner",
    deadline: "Rolling",
    careerTags: ["Digital Growth Marketer", "Content Marketer", "Social Media Manager"],
    skillTags: ["Copywriting", "SEO", "Analytics", "Content strategy"],
    description: "Support content calendars, basic analytics, campaign research, and social media execution.",
    outcome: "Paid part-time role",
    fitReason: "Good for communication-led users building proof of work and income quickly."
  },
  {
    id: "junior-data-analyst-internship",
    title: "Junior Data Analyst Internship",
    provider: "Youth analytics placement",
    category: "Internships",
    country: "Global",
    mode: "Hybrid",
    level: "Beginner",
    deadline: "30 Sep 2026",
    careerTags: ["Junior Data Analyst", "Data Analyst", "Business Analyst"],
    skillTags: ["Excel", "SQL", "Dashboards", "Data cleaning"],
    description: "A structured internship for learning spreadsheet analysis, dashboards, and insight writing.",
    outcome: "Internship experience",
    fitReason: "Ideal for users who like patterns, clarity, and structured business problems."
  },
  {
    id: "south-africa-learnership-digital-skills",
    title: "Digital Skills Learnership",
    provider: "Youth employment program",
    category: "Learnerships",
    country: "South Africa",
    mode: "Hybrid",
    level: "Beginner",
    deadline: "15 Aug 2026",
    careerTags: ["Digital Growth Marketer", "Junior Data Analyst", "UX/UI Designer"],
    skillTags: ["Digital literacy", "Excel", "Communication", "Portfolio storytelling"],
    description: "Work-readiness and digital skills training for young people entering the job market.",
    outcome: "Certificate and workplace exposure",
    fitReason: "Useful when the user needs structure, confidence, and employability support."
  },
  {
    id: "software-apprenticeship-foundations",
    title: "Software Foundations Apprenticeship",
    provider: "Tech apprenticeship collective",
    category: "Apprenticeships",
    country: "Global",
    mode: "Online",
    level: "Beginner",
    deadline: "10 Oct 2026",
    careerTags: ["Software Developer", "Frontend Developer", "Technical Product Builder"],
    skillTags: ["JavaScript", "HTML", "CSS", "Problem solving"],
    description: "Project-led apprenticeship track for learners building web fundamentals and technical confidence.",
    outcome: "Portfolio projects",
    fitReason: "Best for users interested in technical concepts, building products, and remote tech work."
  },
  {
    id: "google-career-certificate-scholarship",
    title: "Google Career Certificate Scholarship",
    provider: "Scholarship partner network",
    category: "Scholarships",
    country: "Global",
    mode: "Online",
    level: "Beginner",
    deadline: "Rolling",
    careerTags: ["UX/UI Designer", "Junior Data Analyst", "Digital Growth Marketer", "IT Support Specialist"],
    skillTags: ["User research", "Data cleaning", "Project management", "Career readiness"],
    description: "Scholarship pathway for job-ready certificates in UX, data analytics, IT support, and project management.",
    outcome: "Funded certificate",
    fitReason: "Strong bridge from uncertainty to structured learning with a recognized credential."
  },
  {
    id: "freecodecamp-responsive-web-design",
    title: "Responsive Web Design Course",
    provider: "freeCodeCamp",
    category: "Free online courses",
    country: "Global",
    mode: "Online",
    level: "Beginner",
    deadline: "Self-paced",
    careerTags: ["Frontend Developer", "UX/UI Designer", "Technical Product Builder"],
    skillTags: ["HTML", "CSS", "Responsive design", "Portfolio"],
    description: "Free hands-on course for creating responsive web pages and foundational portfolio projects.",
    outcome: "Portfolio-ready projects",
    fitReason: "Great for young builders who need visible proof of skill without upfront cost."
  },
  {
    id: "hubspot-digital-marketing-certification",
    title: "Digital Marketing Certification",
    provider: "HubSpot Academy",
    category: "Certifications",
    country: "Global",
    mode: "Online",
    level: "Beginner",
    deadline: "Self-paced",
    careerTags: ["Digital Growth Marketer", "Content Marketer", "Entrepreneur"],
    skillTags: ["Content strategy", "SEO", "Email marketing", "Analytics"],
    description: "Free certification covering digital marketing strategy, content, SEO, and campaign basics.",
    outcome: "Shareable certificate",
    fitReason: "Helpful for career starters and entrepreneurs who want practical growth skills."
  },
  {
    id: "ibm-data-analyst-certificate",
    title: "Data Analyst Professional Certificate",
    provider: "IBM SkillsBuild",
    category: "Certifications",
    country: "Global",
    mode: "Online",
    level: "Beginner",
    deadline: "Self-paced",
    careerTags: ["Junior Data Analyst", "Business Analyst"],
    skillTags: ["Excel", "SQL", "Data visualization", "Python"],
    description: "Beginner data certificate focused on analysis workflows, dashboards, and career-ready projects.",
    outcome: "Professional certificate",
    fitReason: "Matches analytical users who need a credible learning path and portfolio evidence."
  },
  {
    id: "local-youth-scholarship-finder",
    title: "Country Scholarship Watchlist",
    provider: "PATHZY opportunity tracker",
    category: "Scholarships",
    country: "Local",
    mode: "Online",
    level: "Beginner",
    deadline: "Monthly review",
    careerTags: ["Student", "Career Starter", "Entrepreneur"],
    skillTags: ["Application writing", "CV", "Motivation letter"],
    description: "A monthly reminder to search and apply for scholarships in your country based on your study direction.",
    outcome: "Scholarship applications",
    fitReason: "Personalized to users whose income goal or education plan needs funding support."
  }
];

const blankAction = (opportunityId: string): OpportunityAction => ({
  opportunity_id: opportunityId,
  saved: false,
  applied: false,
  completed: false,
  hidden: false
});

function words(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function roadmapCareers(roadmap: GeneratedRoadmap | null) {
  return roadmap?.career_paths?.map((path) => path.title.toLowerCase()) ?? [];
}

function roadmapSkills(roadmap: GeneratedRoadmap | null) {
  return roadmap?.career_paths?.flatMap((path) => path.skills).map((skill) => skill.toLowerCase()) ?? [];
}

export function personalizeOpportunities({
  answers,
  roadmap,
  country,
  actions
}: {
  answers: Partial<DiscoveryAnswers> | null;
  roadmap: GeneratedRoadmap | null;
  country: string | null;
  actions: OpportunityAction[];
}): PersonalizedOpportunity[] {
  const actionMap = new Map(actions.map((action) => [action.opportunity_id, action]));
  const targetCareers = roadmapCareers(roadmap);
  const targetSkills = roadmapSkills(roadmap);
  const interestText = words(answers?.interests);
  const skillText = words(answers?.skills);
  const directionText = words(answers?.preferred_career_direction);
  const challengeText = words(answers?.biggest_challenge);
  const userCountry = words(country);

  return opportunityCatalog
    .map((opportunity) => {
      const reasons: string[] = [];
      let fit = 58;
      const careerMatch = opportunity.careerTags.some((tag) => targetCareers.includes(tag.toLowerCase()) || directionText.includes(tag.toLowerCase().split(" ")[0]));
      const skillMatches = opportunity.skillTags.filter((tag) => targetSkills.includes(tag.toLowerCase()) || skillText.includes(tag.toLowerCase()) || interestText.includes(tag.toLowerCase()));

      if (careerMatch) {
        fit += 18;
        reasons.push("Matches your recommended career direction");
      }

      if (skillMatches.length) {
        fit += Math.min(16, skillMatches.length * 5);
        reasons.push(`Builds ${skillMatches.slice(0, 2).join(" and ")}`);
      }

      if (opportunity.country === "Global" || opportunity.country === "Local" || words(opportunity.country) === userCountry) {
        fit += 8;
        reasons.push(opportunity.country === "Local" ? "Personalized to your country" : `${opportunity.mode} access`);
      }

      if (challengeText.includes("money") || challengeText.includes("income") || challengeText.includes("job")) {
        if (["Recommended jobs", "Internships", "Learnerships", "Apprenticeships", "Scholarships"].includes(opportunity.category)) {
          fit += 8;
          reasons.push("Supports income, funding, or work experience");
        }
      }

      if (!reasons.length) {
        reasons.push(opportunity.fitReason);
      }

      return {
        ...opportunity,
        fit: Math.min(98, fit),
        reasons,
        action: actionMap.get(opportunity.id) ?? blankAction(opportunity.id)
      };
    })
    .filter((opportunity) => !opportunity.action.hidden)
    .sort((a, b) => b.fit - a.fit);
}

export function getOpportunityStats(opportunities: PersonalizedOpportunity[]): OpportunityStats {
  const saved = opportunities.filter((opportunity) => opportunity.action.saved).length;
  const applied = opportunities.filter((opportunity) => opportunity.action.applied).length;
  const completed = opportunities.filter((opportunity) => opportunity.action.completed).length;
  const visible = opportunities.length;

  return {
    saved,
    applied,
    completed,
    visible,
    progress: visible ? Math.round(((saved + applied + completed) / (visible * 3)) * 100) : 0
  };
}
