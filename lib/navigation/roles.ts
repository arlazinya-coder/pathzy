export const userRoles = ["guest", "user", "premium", "founder", "admin"] as const;

export type UserRole = (typeof userRoles)[number];

export type MembershipLevel = "free" | "starter" | "pro" | "premium" | "enterprise";

export type NavigationIdentity = {
  role: UserRole;
  membership: MembershipLevel;
  isAuthenticated: boolean;
  isFounder?: boolean;
  isAdmin?: boolean;
};

export function roleForIdentity(identity: Partial<NavigationIdentity> | null | undefined): UserRole {
  if (!identity?.isAuthenticated) return "guest";
  if (identity.isAdmin) return "admin";
  if (identity.isFounder) return "founder";
  if (identity.membership && identity.membership !== "free") return "premium";
  return "user";
}

export function membershipForAccess(value?: string | null): MembershipLevel {
  if (value === "starter" || value === "pro" || value === "premium" || value === "enterprise") return value;
  return "free";
}

export function isPaidMembership(membership?: MembershipLevel | string | null) {
  return membership === "starter" || membership === "pro" || membership === "premium" || membership === "enterprise";
}
