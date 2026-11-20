export const Role = {
  PATRON: "PATRON",
  LIBRARIAN: "LIBRARIAN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];
