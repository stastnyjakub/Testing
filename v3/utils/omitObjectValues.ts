/**
 * Returns a new object with the specified keys omitted from the original object.
 *
 * @template T - The type of the source object.
 * @template K - The keys to omit from the source object.
 * @param obj - The source object from which to omit keys.
 * @param keys - The keys to omit from the source object.
 * @returns A new object with the specified keys omitted.
 *
 * @example
 * const user = { id: 1, name: 'Alice', password: 'secret' };
 * const safeUser = omitObjectValues(user, 'password');
 * // safeUser is { id: 1, name: 'Alice' }
 */
export function omitObjectValues<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  for (const key in obj) {
    if (!keys.includes(key as unknown as K)) {
      (result as any)[key] = obj[key];
    }
  }
  return result;
}
