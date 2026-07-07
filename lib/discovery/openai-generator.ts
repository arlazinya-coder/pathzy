import OpenAI from "openai";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";

const roadmapSchema = {
  type: "object",
  additionalProperties: false,
  required: ["career_paths", "roadmap_90_days", "today_first_mission"],
  properties: {
    career_paths: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "fit_percentage", "match", "why", "skills"],
        properties: {
          title: { type: "string" },
          fit_percentage: { type: "integer", minimum: 1, maximum: 100 },
          match: { type: "string" },
          why: { type: "string" },
          skills: {
            type: "array",
            minItems: 4,
            maxItems: 7,
            items: { type: "string" }
          }
        }
      }
    },
    roadmap_90_days: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    today_first_mission: { type: "string" }
  }
} as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isGeneratedRoadmap(value: unknown): value is GeneratedRoadmap {
  if (!value || typeof value !== "object") return false;
  const roadmap = value as Partial<GeneratedRoadmap>;

  return (
    Array.isArray(roadmap.career_paths) &&
    roadmap.career_paths.length === 3 &&
    roadmap.career_paths.every((path) =>
      path &&
      typeof path.title === "string" &&
      typeof path.fit_percentage === "number" &&
      typeof path.match === "string" &&
      typeof path.why === "string" &&
      isStringArray(path.skills)
    ) &&
    isStringArray(roadmap.roadmap_90_days) &&
    roadmap.roadmap_90_days.length === 3 &&
    typeof roadmap.today_first_mission === "string"
  );
}

export async function generateOpenAIRoadmap(answers: DiscoveryAnswers): Promise<GeneratedRoadmap> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.72,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pathzy_career_roadmap",
        strict: true,
        schema: roadmapSchema
      }
    },
    messages: [
      {
        role: "system",
        content:
          "You are PATHZY, The Employment Support System. PATHZY helps people move From Potential to Employment by becoming more employable. Support students, graduates, job seekers, professionals, career changers, and returning workers. Generate practical, hopeful, specific employment guidance. Avoid medical, legal, or financial promises. Never promise employment or interviews. The answer must be valid JSON matching the provided schema."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Generate a personalized career roadmap from these Discovery interview answers.",
          requirements: [
            "Return exactly 3 career paths.",
            "Each fit_percentage must be an integer from 1 to 100.",
            "The match field should be human-readable, for example '92% fit'.",
            "Skills should be practical and learnable.",
            "The 90-day roadmap should have exactly 3 items, one for each 30-day phase.",
            "The first daily mission should be a single concrete task the user can do today."
          ],
          answers
        })
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty roadmap.");
  }

  const parsed = JSON.parse(content) as unknown;
  if (!isGeneratedRoadmap(parsed)) {
    throw new Error("OpenAI returned a roadmap in an unexpected format.");
  }

  return {
    ...parsed,
    career_paths: parsed.career_paths.map((path) => ({
      ...path,
      match: path.match || `${path.fit_percentage}% fit`
    }))
  };
}
