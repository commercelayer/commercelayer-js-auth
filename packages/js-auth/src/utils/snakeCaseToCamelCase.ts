export type SnakeCaseToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${Lowercase<T>}${Capitalize<SnakeCaseToCamelCase<U>>}`
    : S

export function snakeCaseToCamelCase<S extends string>(
  str: S,
): SnakeCaseToCamelCase<S> {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", ""),
  ) as SnakeCaseToCamelCase<S>
}
