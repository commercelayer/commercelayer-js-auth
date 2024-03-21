import { snakeCaseToCamelCase } from './snakeCaseToCamelCase.js'

describe('snakeCaseToCamelCase', () => {
  it('should be able to convert a "snake_case" to "camelCase"', () => {
    expect(snakeCaseToCamelCase('john_doe')).toEqual('johnDoe')
    expect(snakeCaseToCamelCase('first_second_third')).toEqual(
      'firstSecondThird'
    )
  })
})
