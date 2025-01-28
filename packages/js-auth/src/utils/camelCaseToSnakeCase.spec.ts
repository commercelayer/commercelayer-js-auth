import { camelCaseToSnakeCase } from './camelCaseToSnakeCase.js'

describe('camelCaseToSnakeCase', () => {
  it('should be able to convert a "camelCase" to "snake_case"', () => {
    expect(camelCaseToSnakeCase('johnDoe')).toEqual('john_doe')
    expect(camelCaseToSnakeCase('firstSecondThird')).toEqual(
      'first_second_third',
    )
  })
})
