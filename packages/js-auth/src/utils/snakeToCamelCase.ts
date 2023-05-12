export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${Lowercase<T>}${Capitalize<SnakeToCamelCase<U>>}`
    : S

export function snakeToCamelCase<S extends string>(
  str: S
): SnakeToCamelCase<S> {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  ) as SnakeToCamelCase<S>
}
