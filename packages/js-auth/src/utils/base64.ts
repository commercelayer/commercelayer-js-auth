/**
 * Creates a [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) URL safe encoded [ASCII](https://developer.mozilla.org/en-US/docs/Glossary/ASCII)
 * string from a _binary string_ (i.e., a string in which each character in the string is treated as a byte of binary data).
 *
 * The "Base64 URL safe" omits the padding `=` and replaces `+/` with `-_` to avoid characters that might cause problems in URL path segments or query parameters.
 *
 * This method works both in Node.js and browsers.
 *
 * @param stringToEncode The binary string to encode.
 * @returns An ASCII string containing the Base64 URL safe representation of `stringToEncode`.
 */
export function encodeBase64URLSafe(stringToEncode: string): string {
  if (typeof window !== 'undefined') {
    return (
      window
        .btoa(stringToEncode)
        // Remove padding equal characters
        .replaceAll('=', '')
        // Replace characters according to base64url specifications
        .replaceAll('+', '-')
        .replaceAll('/', '_')
    )
  }

  return Buffer.from(stringToEncode, 'binary').toString('base64url')
}

/**
 * Decodes a string of data
 * which has been encoded using [Base64](https://developer.mozilla.org/en-US/docs/Glossary/Base64) URL safe encoding.
 *
 * The "Base64 URL safe" omits the padding `=` and replaces `+/` with `-_` to avoid characters that might cause problems in URL path segments or query parameters.
 *
 * This method works both in Node.js and browsers.
 *
 * @param encodedData A binary string (i.e., a string in which each character in the string is treated as a byte of binary data) containing Base64 URL safe -encoded data.
 * @returns An ASCII string containing decoded data from `encodedData`.
 */
export function decodeBase64URLSafe(encodedData: string): string {
  if (typeof window !== 'undefined') {
    return window.atob(
      encodedData
        // Replace characters according to base64url specifications
        .replaceAll('-', '+')
        .replaceAll('_', '/')
    )
  }

  return Buffer.from(encodedData, 'base64url').toString('binary')
}
