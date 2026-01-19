export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R>
  ? R
  : any;

// Extract only public method names (no properties, constructors, or private methods)
export type TClassPublicMethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type Nullable<T> = T | null;

export type NumericIdRecord<T extends string> = {
  [key in T]: number;
};
