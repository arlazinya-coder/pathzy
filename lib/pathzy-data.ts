export const navigation = [
  { label: "Home", href: "/" },
  { label: "My Employment Journey", href: "/dashboard" },
  { label: "My Professional Profile", href: "/professional-identity" },
  { label: "Find Opportunities", href: "/opportunities" },
  { label: "My Applications", href: "/employment-tracker" },
  { label: "Skills & Career Growth", href: "/progress" },
  { label: "Billing", href: "/pricing" },
  { label: "Settings", href: "/settings" }
] as const;

export const productPages = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Discover Your Path", href: "/discovery" },
  { label: "Onboarding", href: "/onboarding" },
  { label: "Interview Practice", href: "/interview" },
  { label: "Pricing", href: "/pricing" }
] as const;

export const roadmapPaths = [
  {
    title: "UX/UI Designer",
    match: "94% fit",
    why: "You combine empathy, visual thinking, and problem-solving. This path can grow into remote work, product teams, freelance income, or startup roles.",
    skills: ["Figma", "User research", "Wireframes", "Design systems", "Portfolio storytelling"]
  },
  {
    title: "Digital Growth Marketer",
    match: "89% fit",
    why: "You enjoy creativity, communication, and measurable results. This path is strong for side hustles, startups, agencies, and creator-led businesses.",
    skills: ["Copywriting", "SEO", "Analytics", "Paid ads", "Content strategy"]
  },
  {
    title: "Junior Data Analyst",
    match: "84% fit",
    why: "You like clarity, patterns, and practical business problems. This path gives a structured ladder toward stable income and high-demand skills.",
    skills: ["Excel", "SQL", "Dashboards", "Data cleaning", "Insight writing"]
  }
] as const;

export const missions = [
  { title: "Learn one new concept", reward: "25 XP", detail: "Complete one focused lesson linked to your career plan." },
  { title: "Apply to two opportunities", reward: "40 XP", detail: "Send two quality applications, scholarship entries, or outreach messages." },
  { title: "Improve your CV", reward: "20 XP", detail: "Add one stronger bullet, skill, project, or measurable result." },
  { title: "Build one portfolio proof", reward: "35 XP", detail: "Create or polish a project artifact that shows what you can do." },
  { title: "Reflect on progress", reward: "10 XP", detail: "Write what worked, what blocked you, and what to do next." }
] as const;

export const dashboardMetrics = [
  { label: "Job Readiness Score", value: "78", suffix: "/100" },
  { label: "Learning Progress", value: "64", suffix: "%" },
  { label: "Skills Learned", value: "12", suffix: "" },
  { label: "Applications Sent", value: "18", suffix: "" },
  { label: "Weekly Streak", value: "9", suffix: " days" },
  { label: "Career Plan Progress", value: "41", suffix: "%" }
] as const;

export const opportunities = [
  "Junior UX internship at a fintech startup",
  "Google UX Design scholarship cohort",
  "Remote social media assistant role",
  "Youth innovation hackathon",
  "Founder accelerator for student businesses",
  "Community data analytics volunteer project"
] as const;

export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Start PATHZY with no credit card. Discover your direction and build your first employment tools.",
    featured: false,
    features: [
      "Career Discovery",
      "Limited Mentor",
      "Create My CV",
      "Create My Cover Letter",
      "LinkedIn Builder",
      "Resume Preview",
      "Cover Letter Preview",
      "LinkedIn Preview",
      "Basic Job Readiness Review",
      "My Career Plan",
      "Job Tracker",
      "Explore Opportunities"
    ]
  },
  {
    name: "Starter",
    price: "$9.99",
    cadence: "month",
    annual: "$99/year",
    description: "For people ready to export, save, and improve application materials with confidence.",
    featured: true,
    features: [
      "Unlimited Downloads",
      "PDF",
      "DOCX",
      "Unlimited Saves",
      "CV Optimizer",
      "LinkedIn Optimizer",
      "Cover Letter Optimizer",
      "Career Passport",
      "Application Kit",
      "Recruiter Messages",
      "Follow-up Emails"
    ]
  },
  {
    name: "Pro",
    price: "$24.99",
    cadence: "month",
    annual: "$199/year",
    description: "For users who want deeper coaching, interview practice, and application review.",
    featured: false,
    features: [
      "Everything in Starter",
      "Unlimited Mentor",
      "Interview Coach",
      "Mock Interviews",
      "Salary Negotiation",
      "Application Review",
      "Priority Processing",
      "Job Readiness Analytics"
    ]
  },
  {
    name: "Premium",
    price: "$49.99",
    cadence: "month",
    annual: "$399/year",
    description: "For advanced career growth, executive positioning, and priority support.",
    featured: false,
    features: [
      "Everything in Premium",
      "Executive Branding",
      "Executive CV",
      "Executive LinkedIn",
      "Personal Branding",
      "Networking Assistant",
      "Executive Career Strategy",
      "Unlimited Usage",
      "Priority Support",
      "Early Features"
    ]
  },
  {
    name: "Founder",
    price: "Invite Only",
    cadence: "12 months",
    description: "For founding testers helping shape PATHZY before public launch.",
    featured: false,
    features: [
      "12 Months Premium",
      "Founder Badge",
      "Founder Number",
      "Priority Support"
    ]
  }
] as const;
