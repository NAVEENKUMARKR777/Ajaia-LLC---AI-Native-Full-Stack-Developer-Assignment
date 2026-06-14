export type AccessDocument = {
  ownerId: string;
};

export type AccessShare = {
  userId: string;
};

/**
 * A user can view a document if they own it or it has been shared with them.
 */
export function canView(
  document: AccessDocument,
  shares: AccessShare[],
  userId: string | null | undefined
): boolean {
  if (!userId) return false;
  if (document.ownerId === userId) return true;
  return shares.some((share) => share.userId === userId);
}

/**
 * In this scope, anyone a document is shared with can also edit it.
 * Kept as a separate function so permission levels can diverge later.
 */
export function canEdit(
  document: AccessDocument,
  shares: AccessShare[],
  userId: string | null | undefined
): boolean {
  return canView(document, shares, userId);
}

/**
 * Only the owner can manage sharing (grant/revoke access).
 */
export function canManageSharing(
  document: AccessDocument,
  userId: string | null | undefined
): boolean {
  if (!userId) return false;
  return document.ownerId === userId;
}
