export const employmentIntelligenceQueryKeys = {
  summary(userVersion?: string | number | null) {
    return ["employment-intelligence", "summary", userVersion ?? "current"] as const;
  },
  detail(userVersion?: string | number | null) {
    return ["employment-intelligence", "detail", userVersion ?? "current"] as const;
  },
  actionHistory(userVersion?: string | number | null) {
    return ["employment-intelligence", "action-history", userVersion ?? "current"] as const;
  }
};
