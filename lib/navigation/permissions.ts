import { isPaidMembership, membershipForAccess, type MembershipLevel, type NavigationIdentity, type UserRole } from "./roles";
import { canAccessFeature, type AccessLevel } from "@/lib/access/entitlements";

export type PermissionContext = Omit<Partial<NavigationIdentity>, "membership"> & {
  role?: UserRole;
  membership?: MembershipLevel | string | null;
  premiumStatus?: string | null;
  accessLevel?: AccessLevel | string | null;
  entitlementStatus?: string | null;
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
  if (context?.accessLevel) {
    return canAccessFeature({
      userId: "",
      accessLevel: context.accessLevel as AccessLevel,
      status: context.entitlementStatus === "expired" || context.accessLevel === "expired" ? "expired" : context.accessLevel === "free" ? "none" : "active",
      isFounder: context.accessLevel === "founder" || Boolean(context.isFounder || context.role === "founder"),
      isAdmin: Boolean(context.isAdmin || context.role === "admin"),
      isBetaFull: context.accessLevel === "beta_full",
      isTrial: context.accessLevel === "trial",
      isPaid: context.accessLevel === "paid_pro" || context.accessLevel === "paid_premium",
      startsAt: null,
      expiresAt: null,
      badge: context.accessLevel === "founder" || context.accessLevel === "beta_full" ? "FOUNDING TESTER" : "PATHZY Member",
      message: null
    }, "document_export");
  }
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
