import { Prisma } from '@prisma/client';

export const userSelect = {
  user_id: true,
  name: true,
  surname: true,
  email: true,
  number: true,
  tsAdded: true,
  tsLastLogin: true,
  userRoles: { include: { role: true } },
  deleted: true,
  tsDeleted: true,
  profilePicture: true,
  contactInfo: {
    select: {
      email: true,
      phone: true,
      note: true,
      language: {
        select: {
          languageCode: true,
          language_id: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export const unsafeUserSelect = {
  ...userSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect;

// Overloads
export function getUserSelect(args: { includeUnsafeValues: true }): typeof unsafeUserSelect;
export function getUserSelect(args?: { includeUnsafeValues?: false | undefined }): typeof userSelect;
export function getUserSelect(args?: { includeUnsafeValues?: boolean }): typeof userSelect | typeof unsafeUserSelect;

// Implementation
export function getUserSelect(args?: { includeUnsafeValues?: boolean }) {
  const includeUnsafeValues = args?.includeUnsafeValues ?? false;
  return includeUnsafeValues ? unsafeUserSelect : userSelect;
}
