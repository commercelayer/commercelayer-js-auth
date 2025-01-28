import { vi } from 'vitest'
import { decodeBase64URLSafe, encodeBase64URLSafe } from './base64.js'

const stringifiedObject = JSON.stringify({
  customer: {
    first_name: 'John',
    last_name: 'Doe',
  },
})

const stringifiedObjectWithSpecialChar = JSON.stringify({
  customer: {
    first_name: 'Jörg',
    last_name: 'Doe',
  },
})

describe('Using `Buffer`', () => {
  beforeAll(() => {
    vi.stubGlobal('atob', undefined)
    vi.stubGlobal('btoa', undefined)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  runTests()
})

describe('Using `btoa` and `atob`', () => {
  runTests()
})

function runTests(): void {
  describe('encodeBase64UrlSafe', () => {
    it('should be able to create a Base64 URL safe encoded ASCII string from a binary string.', () => {
      expect(encodeBase64URLSafe('', 'utf-8')).toEqual('')
      expect(encodeBase64URLSafe('Hello, world', 'utf-8')).toEqual(
        'SGVsbG8sIHdvcmxk',
      )

      expect(encodeBase64URLSafe(stringifiedObject, 'utf-8')).toEqual(
        'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ',
      )

      expect(
        encodeBase64URLSafe(stringifiedObjectWithSpecialChar, 'utf-8'),
      ).toEqual(
        'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSsO2cmciLCJsYXN0X25hbWUiOiJEb2UifX0',
      )

      expect(encodeBase64URLSafe('subjects?_d=1', 'utf-8')).toEqual(
        'c3ViamVjdHM_X2Q9MQ',
      )
    })
  })

  describe('decodeBase64UrlSafe', () => {
    it('should be able to decode a string of data which has been encoded using Base64 encoding.', () => {
      expect(decodeBase64URLSafe('', 'utf-8')).toEqual('')
      expect(decodeBase64URLSafe('SGVsbG8sIHdvcmxk', 'utf-8')).toEqual(
        'Hello, world',
      )

      expect(
        decodeBase64URLSafe(
          'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ==',
          'utf-8',
        ),
      ).toEqual(stringifiedObject)

      expect(
        decodeBase64URLSafe(
          'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSsO2cmciLCJsYXN0X25hbWUiOiJEb2UifX0',
          'utf-8',
        ),
      ).toEqual(stringifiedObjectWithSpecialChar)

      expect(decodeBase64URLSafe('c3ViamVjdHM/X2Q9MQ==', 'utf-8')).toEqual(
        'subjects?_d=1',
      )
    })

    it('should be able to decode a string of data which has been encoded using Base64 URL safe encoding.', () => {
      expect(decodeBase64URLSafe('', 'utf-8')).toEqual('')
      expect(decodeBase64URLSafe('SGVsbG8sIHdvcmxk', 'utf-8')).toEqual(
        'Hello, world',
      )

      expect(
        decodeBase64URLSafe(
          'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ',
          'utf-8',
        ),
      ).toEqual(stringifiedObject)

      expect(decodeBase64URLSafe('c3ViamVjdHM_X2Q9MQ', 'utf-8')).toEqual(
        'subjects?_d=1',
      )
    })
  })
}
