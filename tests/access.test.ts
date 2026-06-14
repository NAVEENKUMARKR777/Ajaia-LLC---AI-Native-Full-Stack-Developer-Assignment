import { describe, it, expect } from "vitest";
import { canView, canEdit, canManageSharing } from "@/lib/access";

const document = { ownerId: "owner-1" };
const shares = [{ userId: "shared-1" }];

describe("canView", () => {
  it("allows the owner", () => {
    expect(canView(document, shares, "owner-1")).toBe(true);
  });

  it("allows a user the document is shared with", () => {
    expect(canView(document, shares, "shared-1")).toBe(true);
  });

  it("denies an unrelated user", () => {
    expect(canView(document, shares, "stranger-1")).toBe(false);
  });

  it("denies when there is no user", () => {
    expect(canView(document, shares, null)).toBe(false);
    expect(canView(document, shares, undefined)).toBe(false);
  });
});

describe("canEdit", () => {
  it("mirrors canView for owner and shared users", () => {
    expect(canEdit(document, shares, "owner-1")).toBe(true);
    expect(canEdit(document, shares, "shared-1")).toBe(true);
    expect(canEdit(document, shares, "stranger-1")).toBe(false);
  });
});

describe("canManageSharing", () => {
  it("only allows the owner to manage sharing", () => {
    expect(canManageSharing(document, "owner-1")).toBe(true);
    expect(canManageSharing(document, "shared-1")).toBe(false);
    expect(canManageSharing(document, null)).toBe(false);
  });
});
