export function mapKeys(
  obj: Record<string, unknown>,
  fn: (key: string) => string
): Record<string, unknown> {
  return Object.keys(obj).reduce((acc: any, key) => {
    const camelKey = fn(key)
    acc[camelKey] = obj[key]
    return acc
  }, {})
}
