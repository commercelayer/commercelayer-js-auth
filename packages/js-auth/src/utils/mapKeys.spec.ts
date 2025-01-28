import { camelCaseToSnakeCase } from './camelCaseToSnakeCase.js'
import { mapKeys } from './mapKeys.js'
import { snakeCaseToCamelCase } from './snakeCaseToCamelCase.js'

describe('mapKeys', () => {
  it('should map all the key from the given object using the given fn', () => {
    expect(
      mapKeys(
        {
          johnDoe: 42,
          firstSecondThird: 'ehi there!',
        },
        camelCaseToSnakeCase,
      ),
    ).toEqual({
      john_doe: 42,
      first_second_third: 'ehi there!',
    })

    expect(
      mapKeys(
        {
          john_doe: 42,
          first_second_third: 'ehi there!',
        },
        snakeCaseToCamelCase,
      ),
    ).toEqual({
      johnDoe: 42,
      firstSecondThird: 'ehi there!',
    })
  })
})
