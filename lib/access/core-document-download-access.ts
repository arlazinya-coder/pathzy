type CoreDownloadPermissionContext = {
  isAuthenticated?: boolean | null;
  role?: string | null;
};

export const currentCoreDocumentDownloadAccess = "allowed" as const;

export function canDownloadCoreDocument(context: CoreDownloadPermissionContext | null | undefined) {
  return currentCoreDocumentDownloadAccess === "allowed" && Boolean(context?.isAuthenticated || context?.role && context.role !== "guest");
}
