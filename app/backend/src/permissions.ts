import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  project: ["create", "read", "update", "delete"],
  workspace: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
  archive: ["create", "read", "update", "delete"],
  user: ["create", "read", "update", "delete", "manage"],
  billing: ["create", "read", "update", "delete"],
  setting: ["read", "update", "delete"], // Par défaut l'utilisateurs ou l'admin ne créer jamais les setting
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  workspace: ["read","create", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  task: ["create","read","update", "delete"],
  archive: ["create", "read","update", "delete"],
  billing: ["create", "read", "update", "delete"],
  setting: ["read", "update", "delete"],
  user: ["manage"],
});

export const user = ac.newRole({
  workspace: ["read","create", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  task: ["create","read","update", "delete"],
  archive: ["create", "read","update", "delete"],
  billing: ["create", "read", "update", "delete"],
  setting: ["read", "update", "delete"],
  user: [],
});

// Unpaid balance or quota exceeded: account is now read-only
export const restricted = ac.newRole({
  workspace: ["read"],
  project: ["read", "delete"],
  task: ["read", "delete"],
  archive: ["read", "delete"],
  billing: ["read", "update"],
  setting: ["read", "update", "delete"],
  user: [],
});

export const roles_center = {
  admin,
  user,
  restricted,
} as const;

export type Role = keyof typeof roles_center;
