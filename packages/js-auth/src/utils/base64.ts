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
export function encodeBase64URLSafe(
  stringToEncode: string,
  encoding: 'utf-8' | 'binary'
): string {
  if (typeof btoa !== 'undefined') {
    // Convert the string to a UTF-8 byte sequence before encoding
    const utf8String =
      encoding === 'utf-8'
        ? unescape(encodeURIComponent(stringToEncode))
        : stringToEncode

    return (
      btoa(utf8String)
        // Remove padding equal characters
        .replaceAll('=', '')
        // Replace characters according to base64url specifications
        .replaceAll('+', '-')
        .replaceAll('/', '_')
    )
  }

  return Buffer.from(stringToEncode, encoding).toString('base64url')
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
export function decodeBase64URLSafe(
  encodedData: string,
  encoding: 'utf-8' | 'binary'
): string {
  if (typeof atob !== 'undefined') {
    const decoded = atob(
      encodedData
        // Replace characters according to base64url specifications
        .replaceAll('-', '+')
        .replaceAll('_', '/')
    )

    return encoding === 'utf-8' ? decodeURIComponent(escape(decoded)) : decoded
  }

  return Buffer.from(encodedData, 'base64url').toString(encoding)
}
