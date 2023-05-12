import { type TReturn, type GrantType, type TOptions } from '#types'
import { camelCaseToSnake } from '#utils/camelCaseToSnake'
import { snakeToCamelCase } from '#utils/snakeToCamelCase'

export async function authentication<G extends GrantType>(
  grantType: G,
  { domain = 'commercelayer.io', slug, ...options }: TOptions<G>
): Promise<TReturn<G>> {
  const attributes = {
    grant_type: grantType,
    ...options
  }
  const body = Object.keys(attributes).reduce((acc: any, key) => {
    const camelKey = camelCaseToSnake(key)
    acc[camelKey] = attributes[key as keyof typeof attributes]
    return acc
  }, {})
  return await fetch(`https://${slug}.${domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  }).then(async (response) => {
    const json = await response.json()
    return Object.keys(json).reduce((acc: any, key) => {
      const camelKey = snakeToCamelCase(key)
      acc[camelKey] = json[key]
      return acc
    }, {}) as TReturn<G>
  })
}

export default authentication
