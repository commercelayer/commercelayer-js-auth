import { camelCaseToSnake } from './camelCaseToSnake.js'
import { snakeToCamelCase } from './snakeToCamelCase.js'

export interface TokenJson {
  expires: Date
  expires_in: number
  [key: string]: string | number | Date
}

export async function doRequest<Output>({
  attributes,
  headers,
  endpoint
}: {
  attributes: Record<string, unknown>
  headers?: HeadersInit
  endpoint: string
}): Promise<Output> {
  const body = Object.keys(attributes).reduce((acc: any, key) => {
    const camelKey = camelCaseToSnake(key)
    acc[camelKey] = attributes[key]
    return acc
  }, {})

  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  }).then(async (response) => {
    const json: TokenJson = await response.json()
    json.expires = new Date(Date.now() + json.expires_in * 1000)
    return Object.keys(json).reduce((acc: any, key) => {
      const camelKey = snakeToCamelCase(key)
      acc[camelKey] = json[key]
      return acc
    }, {})
  })
}
