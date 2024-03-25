import { atob, btoa, base64url } from './base64.js'

const stringifiedObject = JSON.stringify({
  customer: {
    first_name: 'John',
    last_name: 'Doe'
  }
})

describe('btoa', () => {
  it('should be able to create a Base64-encoded ASCII string from a binary string.', () => {
    expect(btoa('')).toEqual('')
    expect(btoa('Hello, world')).toEqual('SGVsbG8sIHdvcmxk')

    expect(btoa(stringifiedObject)).toEqual(
      'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ=='
    )
  })

  expect(
    btoa(
      '0\x82\x0760\x82\x06\x1E \x03\x02\x01\x02\x02\x10\tW¸\x13HxölÈÐ×\x12¨Ìµú0'
    )
  ).toEqual('MIIHNjCCBh6gAwIBAgIQCVe4E0h49mzI0NcSqMy1+jA=')

  expect(btoa('subjects?_d=1')).toEqual('c3ViamVjdHM/X2Q9MQ==')
})

describe('atob', () => {
  it('should be able to decode a string of data which has been encoded using Base64 encoding.', () => {
    expect(atob('')).toEqual('')
    expect(atob('SGVsbG8sIHdvcmxk')).toEqual('Hello, world')

    expect(
      atob(
        'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ=='
      )
    ).toEqual(stringifiedObject)

    expect(atob('MIIHNjCCBh6gAwIBAgIQCVe4E0h49mzI0NcSqMy1+jA=')).toEqual(
      '0\x82\x0760\x82\x06\x1E \x03\x02\x01\x02\x02\x10\tW¸\x13HxölÈÐ×\x12¨Ìµú0'
    )

    expect(atob('c3ViamVjdHM/X2Q9MQ==')).toEqual('subjects?_d=1')
  })
})

describe('base64url', () => {
  it('should be able to create a Base64-encoded ASCII string from a binary string.', () => {
    expect(base64url('')).toEqual('')
    expect(base64url('Hello, world')).toEqual('SGVsbG8sIHdvcmxk')

    expect(base64url(stringifiedObject)).toEqual(
      'eyJjdXN0b21lciI6eyJmaXJzdF9uYW1lIjoiSm9obiIsImxhc3RfbmFtZSI6IkRvZSJ9fQ'
    )

    expect(
      base64url(
        '0\x82\x0760\x82\x06\x1E \x03\x02\x01\x02\x02\x10\tW¸\x13HxölÈÐ×\x12¨Ìµú0'
      )
    ).toEqual('MIIHNjCCBh6gAwIBAgIQCVe4E0h49mzI0NcSqMy1-jA')

    expect(base64url('subjects?_d=1')).toEqual('c3ViamVjdHM_X2Q9MQ')
  })
})
