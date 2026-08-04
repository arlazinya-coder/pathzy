export const supportIntensityLevels = ["SELF_GUIDED", "LIGHT_GUIDANCE", "STRUCTURED_GUIDANCE", "HIGH_SUPPORT", "HUMAN_SUPPORT_RECOMMENDED"] as const;

export type SupportIntensityLevel = (typeof supportIntensityLevels)[number];

export type SupportIntensityDefinition = {
  level: SupportIntensityLevel;
  criteria: string[];
  recommendedInterfaceBehaviour: string;
  explanationStyle: string;
  numberOfActionsShown: number;
  careerCoachBehaviour: string;
  escalationConditions: string[];
  literacyConsiderations: string[];
  urgencyConsiderations: string[];
};

export const supportIntensityDefinitions: SupportIntensityDefinition[] = [
  {
    level: "SELF_GUIDED",
    criteria: ["High confidence", "Clear next action", "No critical practical blocker"],
    recommendedInterfaceBehaviour: "Show concise guidance and let the user proceed.",
    explanationStyle: "Brief and direct.",
    numberOfActionsShown: 3,
    careerCoachBehaviour: "Answer questions and confirm decisions.",
    escalationConditions: [],
    literacyConsiderations: ["Avoid jargon even when user is self-guided."],
    urgencyConsiderations: ["Do not hide immediate-income options when relevant."]
  },
  {
    level: "LIGHT_GUIDANCE",
    criteria: ["Some missing information", "Manageable uncertainty"],
    recommendedInterfaceBehaviour: "Show one primary action and optional supporting actions.",
    explanationStyle: "Supportive and practical.",
    numberOfActionsShown: 3,
    careerCoachBehaviour: "Offer focused clarifying prompts.",
    escalationConditions: ["Repeated confusion", "User asks for more support"],
    literacyConsiderations: ["Use plain language and examples."],
    urgencyConsiderations: ["Prioritize actions with visible near-term value."]
  },
  {
    level: "STRUCTURED_GUIDANCE",
    criteria: ["Multiple dependencies", "Moderate barriers", "Low confidence in next route"],
    recommendedInterfaceBehaviour: "Use step-by-step flow with one primary action.",
    explanationStyle: "Clear, reassuring, and explicit.",
    numberOfActionsShown: 2,
    careerCoachBehaviour: "Guide sequence and check understanding.",
    escalationConditions: ["Blocked progress", "conflicting data"],
    literacyConsiderations: ["Prefer short sentences and concrete labels."],
    urgencyConsiderations: ["Separate urgent income support from longer-term career steps."]
  },
  {
    level: "HIGH_SUPPORT",
    criteria: ["High barrier severity", "Low digital access", "high uncertainty"],
    recommendedInterfaceBehaviour: "Reduce choices and provide guided review.",
    explanationStyle: "Calm, non-judgmental, and specific.",
    numberOfActionsShown: 1,
    careerCoachBehaviour: "Ask one question at a time and avoid overload.",
    escalationConditions: ["Critical blocker", "high risk of failed application"],
    literacyConsiderations: ["Use accessible language and avoid dense screens."],
    urgencyConsiderations: ["Protect urgent users from long low-impact tasks."]
  },
  {
    level: "HUMAN_SUPPORT_RECOMMENDED",
    criteria: ["Legal uncertainty", "critical documentation blocker", "complex external barrier"],
    recommendedInterfaceBehaviour: "Recommend human or specialist support where available.",
    explanationStyle: "Careful and bounded.",
    numberOfActionsShown: 1,
    careerCoachBehaviour: "Prepare questions and documents; do not give legal conclusions.",
    escalationConditions: ["Work authorization uncertainty", "safety or legal concern"],
    literacyConsiderations: ["Explain what to ask a human support provider."],
    urgencyConsiderations: ["Balance immediate options with specialist support."]
  }
];
