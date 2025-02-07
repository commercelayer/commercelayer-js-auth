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
  encoding: "utf-8" | "binary",
): string {
  if (typeof btoa !== "undefined") {
    let utf8String = stringToEncode

    if (encoding === "utf-8") {
      // Encode the string as UTF-8
      const utf8Bytes = new TextEncoder().encode(stringToEncode)

      // Convert the UTF-8 bytes to a Base64 string
      utf8String = String.fromCharCode(...utf8Bytes)
    }

    return (
      btoa(utf8String)
        // Remove padding equal characters
        .replaceAll("=", "")
        // Replace characters according to base64url specifications
        .replaceAll("+", "-")
        .replaceAll("/", "_")
    )
  }

  return Buffer.from(stringToEncode, encoding).toString("base64url")
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
  encoding: "utf-8" | "binary",
): string {
  if (typeof atob !== "undefined") {
    const decoded = atob(
      encodedData
        // Replace characters according to base64url specifications
        .replaceAll("-", "+")
        .replaceAll("_", "/")
        // Add padding if necessary
        .padEnd(encodedData.length + ((4 - (encodedData.length % 4)) % 4), "="),
    )

    if (encoding === "utf-8") {
      // Decode the Base64 string into bytes
      const byteArray = new Uint8Array(
        [...decoded].map((char) => char.charCodeAt(0)),
      )

      // Convert the bytes back to a UTF-8 string
      return new TextDecoder().decode(byteArray)
    }

    return decoded
  }

  return Buffer.from(encodedData, "base64url").toString(encoding)
}
