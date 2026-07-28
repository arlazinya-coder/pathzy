import { canAccessFeature, type EntitlementFeature, type UserEntitlements } from "@/lib/access/entitlements";

export const pathzyRoles = ["user", "founder_user", "support", "admin", "super_admin", "background_service"] as const;

export type PathzyRole = (typeof pathzyRoles)[number];
export type AuthorizationAction = "read" | "create" | "update" | "delete" | "export" | "admin_manage" | "support_review";

export type AuthorizationActor = {
  userId: string | null;
  role: PathzyRole;
  entitlements?: UserEntitlements | null;
};

export type ResourceOwnership = {
  ownerUserId?: string | null;
  resourceUserId?: string | null;
  feature?: EntitlementFeature;
  sensitive?: boolean;
};

export type AuthorizationDecision = {
  allowed: boolean;
  reason: string;
  audit: {
    required: boolean;
    event: string;
  };
};

const adminRoles: PathzyRole[] = ["admin", "super_admin", "background_service"];
const supportRoles: PathzyRole[] = ["support", "admin", "super_admin"];

export function normalizePathzyRole(value?: string | null): PathzyRole {
  if (value === "founder" || value === "founder_user") return "founder_user";
  if (value === "support") return "support";
  if (value === "admin") return "admin";
  if (value === "super_admin") return "super_admin";
  if (value === "background_service" || value === "service_role") return "background_service";
  return "user";
}

export function roleAllowsAdmin(role: PathzyRole) {
  return adminRoles.includes(role);
}

export function roleAllowsSupport(role: PathzyRole) {
  return supportRoles.includes(role);
}

export function isOwner(actor: AuthorizationActor, resource: ResourceOwnership) {
  const owner = resource.ownerUserId ?? resource.resourceUserId;
  return Boolean(actor.userId && owner && actor.userId === owner);
}

function decision(allowed: boolean, reason: string, event: string, auditRequired = false): AuthorizationDecision {
  return {
    allowed,
    reason,
    audit: {
      required: auditRequired,
      event
    }
  };
}

export function authorizeOwnerAccess(actor: AuthorizationActor, resource: ResourceOwnership, action: AuthorizationAction = "read") {
  if (!actor.userId && actor.role !== "background_service") {
    return decision(false, "Authentication is required.", `authorization.${action}.anonymous_denied`);
  }
  if (roleAllowsAdmin(actor.role)) {
    return decision(true, "Administrative server-side role allowed.", `authorization.${action}.admin_allowed`, true);
  }
  if (action === "support_review" && roleAllowsSupport(actor.role)) {
    return decision(true, "Support role allowed for limited metadata review.", "authorization.support_review.allowed", true);
  }
  if (isOwner(actor, resource)) {
    return decision(true, "Owner access allowed.", `authorization.${action}.owner_allowed`, resource.sensitive === true);
  }
  return decision(false, "This resource belongs to another PATHZY user.", `authorization.${action}.cross_user_denied`, true);
}

export function authorizeFeatureAccess(actor: AuthorizationActor, feature: EntitlementFeature, resource: ResourceOwnership = {}, action: AuthorizationAction = "read") {
  const ownerDecision = resource.ownerUserId || resource.resourceUserId ? authorizeOwnerAccess(actor, resource, action) : decision(Boolean(actor.userId || actor.role === "background_service"), "Authenticated action allowed.", `authorization.${action}.authenticated`);
  if (!ownerDecision.allowed) return ownerDecision;
  if (actor.role === "background_service" || roleAllowsAdmin(actor.role)) return ownerDecision;
  if (!canAccessFeature(actor.entitlements, feature)) {
    return decision(false, "This feature is available with PATHZY Premium.", `authorization.${feature}.entitlement_denied`, true);
  }
  return decision(true, "Feature access allowed.", `authorization.${feature}.allowed`, ownerDecision.audit.required);
}

export function assertAuthorized(decisionResult: AuthorizationDecision) {
  if (!decisionResult.allowed) {
    throw new Error(decisionResult.reason);
  }
}
