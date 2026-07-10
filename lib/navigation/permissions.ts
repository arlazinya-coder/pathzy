import { isPaidMembership, membershipForAccess, type MembershipLevel, type NavigationIdentity, type UserRole } from "./roles";

export type PermissionContext = Omit<Partial<NavigationIdentity>, "membership"> & {
  role?: UserRole;
  membership?: MembershipLevel | string | null;
  premiumStatus?: string | null;
  mentorMessagesToday?: number | null;
};

const freeMentorDailyLimit = 3;

export function normalizePermissionContext(context: PermissionContext | null | undefined): NavigationIdentity {
  const membership = membershipForAccess(context?.membership ?? context?.premiumStatus);
  const isFounder = Boolean(context?.isFounder || context?.role === "founder");
  const isAdmin = Boolean(context?.isAdmin || context?.role === "admin");
  const isAuthenticated = Boolean(context?.isAuthenticated || context?.role && context.role !== "guest");
  const role: UserRole = isAdmin ? "admin" : isFounder ? "founder" : isPaidMembership(membership) ? "premium" : isAuthenticated ? "user" : "guest";
  return { role, membership, isAuthenticated, isFounder, isAdmin };
}

export function hasPremiumAccess(context: PermissionContext | null | undefined) {
  const normalized = normalizePermissionContext(context);
  return normalized.role === "admin" || normalized.role === "founder" || isPaidMembership(normalized.membership);
}

export function canCreateCV(context: PermissionContext | null | undefined) {
  return normalizePermissionContext(context).isAuthenticated;
}

export function canAccessBilling(context: PermissionContext | null | undefined) {
  return normalizePermissionContext(context).isAuthenticated;
}

export function canAccessInterview(context: PermissionContext | null | undefined) {
  return normalizePermissionContext(context).isAuthenticated;
}

export function canAccessPremiumAI(context: PermissionContext | null | undefined) {
  return hasPremiumAccess(context);
}

export function canAccessAdmin(context: PermissionContext | null | undefined) {
  return normalizePermissionContext(context).role === "admin";
}

export function canUseProfessionalIdentity(context: PermissionContext | null | undefined) {
  return normalizePermissionContext(context).isAuthenticated;
}

export function canExportProfessionalDocuments(context: PermissionContext | null | undefined) {
  return hasPremiumAccess(context);
}

export function canUsePremiumTemplates(context: PermissionContext | null | undefined) {
  return normalizePermissionContext(context).isAuthenticated;
}

export function canUseMentor(context: PermissionContext | null | undefined) {
  const normalized = normalizePermissionContext(context);
  if (!normalized.isAuthenticated) return false;
  if (hasPremiumAccess(context)) return true;
  return (context?.mentorMessagesToday ?? 0) < freeMentorDailyLimit;
}

export function mentorDailyLimitFor(context: PermissionContext | null | undefined) {
  return hasPremiumAccess(context) ? null : freeMentorDailyLimit;
}
