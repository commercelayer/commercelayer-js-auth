export type CamelCaseToSnake<
  T extends string,
  P extends string = ''
> = string extends T
  ? string
  : T extends `${infer C}${infer R}`
  ? CamelCaseToSnake<
      R,
      `${P}${C extends Lowercase<C> ? '' : '_'}${Lowercase<C>}`
    >
  : P

export function camelCaseToSnake<S extends string>(
  str: S
): CamelCaseToSnake<S> {
  return str.replace(/[A-Z]/g, function (letter) {
    return '_' + letter.toLowerCase()
  }) as CamelCaseToSnake<S>
}
