export type CamelCaseToSnakeCase<
  T extends string,
  P extends string = "",
> = string extends T
  ? string
  : T extends `${infer C}${infer R}`
    ? CamelCaseToSnakeCase<
        R,
        `${P}${C extends Lowercase<C> ? "" : "_"}${Lowercase<C>}`
      >
    : P

export function camelCaseToSnakeCase<S extends string>(
  str: S,
): CamelCaseToSnakeCase<S> {
  return str.replace(
    /[A-Z]/g,
    (letter) => `_${letter.toLowerCase()}`,
  ) as CamelCaseToSnakeCase<S>
}
