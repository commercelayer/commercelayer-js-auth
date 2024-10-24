import { vi } from 'vitest'
import { decodeBase64URLSafe, encodeBase64URLSafe } from './base64.js'

const stringifiedObject = JSON.stringify({
  customer: {
    first_name: 'John',
    last_name: 'Doe'
  }
})

const stringifiedObjectWithSpecialChar = JSON.stringify({
  customer: {
    first_name: 'Jörg',
    last_name: 'Doe'
  }
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
      expect(encodeBase64URLSafe('')).toEqual('')
      expect(encodeBase64URLSafe('Hello, world')).toEqual('SGVsbG8sIHdvcmxk')

      expect(encodeBase64URLSafe(stringifiedObject)).toEqual(
        'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ'
      )

      expect(encodeBase64URLSafe(stringifiedObjectWithSpecialChar)).toEqual(
        'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSsO2cmciLCJsYXN0X25hbWUiOiJEb2UifX0'
      )

      expect(
        encodeBase64URLSafe(
          '0\x82\x0760\x82\x06\x1E \x03\x02\x01\x02\x02\x10\tW¸\x13HxölÈÐ×\x12¨Ìµú0'
        )
      ).toEqual('MIIHNjCCBh6gAwIBAgIQCVe4E0h49mzI0NcSqMy1-jA')

      expect(encodeBase64URLSafe('subjects?_d=1')).toEqual('c3ViamVjdHM_X2Q9MQ')
    })
  })

  describe('decodeBase64UrlSafe', () => {
    it('should be able to decode a string of data which has been encoded using Base64 encoding.', () => {
      expect(decodeBase64URLSafe('')).toEqual('')
      expect(decodeBase64URLSafe('SGVsbG8sIHdvcmxk')).toEqual('Hello, world')

      expect(
        decodeBase64URLSafe(
          'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ=='
        )
      ).toEqual(stringifiedObject)

      expect(
        decodeBase64URLSafe('MIIHNjCCBh6gAwIBAgIQCVe4E0h49mzI0NcSqMy1+jA=')
      ).toEqual(
        '0\x82\x0760\x82\x06\x1E \x03\x02\x01\x02\x02\x10\tW¸\x13HxölÈÐ×\x12¨Ìµú0'
      )

      expect(
        decodeBase64URLSafe(
          'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSsO2cmciLCJsYXN0X25hbWUiOiJEb2UifX0'
        )
      ).toEqual(stringifiedObjectWithSpecialChar)

      expect(decodeBase64URLSafe('c3ViamVjdHM/X2Q9MQ==')).toEqual(
        'subjects?_d=1'
      )
    })

    it('should be able to decode a string of data which has been encoded using Base64 URL safe encoding.', () => {
      expect(decodeBase64URLSafe('')).toEqual('')
      expect(decodeBase64URLSafe('SGVsbG8sIHdvcmxk')).toEqual('Hello, world')

      expect(
        decodeBase64URLSafe(
          'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ'
        )
      ).toEqual(stringifiedObject)

      expect(
        decodeBase64URLSafe('MIIHNjCCBh6gAwIBAgIQCVe4E0h49mzI0NcSqMy1-jA')
      ).toEqual(
        '0\x82\x0760\x82\x06\x1E \x03\x02\x01\x02\x02\x10\tW¸\x13HxölÈÐ×\x12¨Ìµú0'
      )

      expect(decodeBase64URLSafe('c3ViamVjdHM_X2Q9MQ')).toEqual('subjects?_d=1')
    })
  })
}
