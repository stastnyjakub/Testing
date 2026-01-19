import { Prisma } from '@prisma/client';

// export const checkDispatcherAccess = async (authPayload: TAuthTokenPayload, dispatcherId?: number, token?: string) => {
//   if (authPayload.role === EUserRole.OnboardingUser) {
//     const authorized = await prisma.onboardingtoken.findFirst({
//       where: {
//         token: token,
//         solved: false,
//       },
//     });
//     return !!authorized;
//   }
//   if (authPayload.role === EUserRole.Dispatcher) {
//     return authPayload.userId === dispatcherId;
//   }
//   return true;
// };

export const excludeProperties = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

type A<T extends string> = T extends `${infer U}ScalarFieldEnum` ? U : never;
type Entity = A<keyof typeof Prisma>;
type Keys<T extends Entity> = Extract<keyof (typeof Prisma)[keyof Pick<typeof Prisma, `${T}ScalarFieldEnum`>], string>;

export function prismaExclude<T extends Entity, K extends Keys<T>>(type: T, omit: K[]) {
  type Key = Exclude<Keys<T>, K>;
  type TMap = Record<Key, true>;
  const result: TMap = {} as TMap;
  for (const key in Prisma[`${type}ScalarFieldEnum`]) {
    if (!omit.includes(key as K)) {
      result[key as Key] = true;
    }
  }
  return result;
}
