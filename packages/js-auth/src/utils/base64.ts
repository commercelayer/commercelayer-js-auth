/**
 * The `atob()` function decodes a string of data
 * which has been encoded using [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) encoding.
 *
 * This method works both in Node.js and browsers.
 *
 * @link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/atob)
 * @param encodedData A binary string (i.e., a string in which each character in the string is treated as a byte of binary data) containing base64-encoded data.
 * @returns An ASCII string containing decoded data from `encodedData`.
 */
export function atob(encodedData: string): string {
  if (typeof window !== 'undefined') {
    return window.atob(encodedData)
  }

  return Buffer.from(encodedData, 'base64').toString('binary')
}

/**
 * The `btoa()` method creates a [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64)-encoded [ASCII](https://developer.mozilla.org/en-US/docs/Glossary/ASCII)
 * string from a _binary string_ (i.e., a string in which each character in the string is treated as a byte of binary data).
 *
 * This method works both in Node.js and browsers.
 *
 * @link [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/btoa)
 * @param stringToEncode The binary string to encode.
 * @returns An ASCII string containing the Base64 representation of `stringToEncode`.
 */
export function btoa(stringToEncode: string): string {
  if (typeof window !== 'undefined') {
    return window.btoa(stringToEncode)
  }

  return Buffer.from(stringToEncode, 'binary').toString('base64')
}

/**
 *
 * @param source
 * @returns
 */
export function base64url(source: string): string {
  return (
    btoa(source)
      // Remove padding equal characters
      .replace(/=+$/, '')
      // Replace characters according to base64url specifications
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  )
}