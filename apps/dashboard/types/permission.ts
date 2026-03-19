export const Permission = {
  ORG: {
    SYS_PROFILE: {
      MANAGE: "org:sys_profile:manage",
      DELETE: "org:sys_profile:delete",
    },
    SYS_API_KEYS: {
      READ: "org:sys_api_keys:read",
      MANAGE: "org:sys_api_keys:manage",
    },
    SYS_BILLING: {
      READ: "org:sys_billing:read",
      MANAGE: "org:sys_billing:manage",
    },
    SYS_DOMAINS: {
      READ: "org:sys_domains:read",
      MANAGE: "org:sys_domains:manage",
    },
    SYS_MEMBERSHIPS: {
      READ: "org:sys_memberships:read",
      MANAGE: "org:sys_memberships:manage",
    },
  },
} as const;

type DeepValues<T> = T extends string
  ? T
  : { [K in keyof T]: DeepValues<T[K]> }[keyof T];

export type Permission = DeepValues<typeof Permission>;
