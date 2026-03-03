import type { CommerceLayerJWT } from "./jwtDecode.js"

/**
 * Return a normalized token type from the provided payload.
 *
 * The token type is a string in the format `{applicationKind}:{ownerType}`, where:
 * - `applicationKind` is the kind of application used to authenticate (e.g. `dashboard`, `user`, `sales_channel`, `integration`, `webapp`).
 * - `ownerType` is the lowercased type of the token owner (e.g. `customer`, `user`), or `guest` when no owner is present.
 *
 * This is useful for quick authorization checks in any context, for example allowing only `integration:*`
 * tokens, or only storefront tokens such as `sales_channel:guest` and `sales_channel:customer`.
 *
 * @param payload The JWT payload to inspect.
 * @returns The token type string in the form `{applicationKind}:{ownerType}`.
 */
export function getTokenType(payload: CommerceLayerJWT["payload"]): TokenType {
  const applicationKind = payload.application.kind
  const ownerType =
    "owner" in payload && payload.owner != null
      ? (payload.owner.type.toLowerCase() as Lowercase<
          typeof payload.owner.type
        >)
      : "guest"

  return `${applicationKind}:${ownerType}`
}

/**
 * Token classification string returned by {@link getTokenType}.
 *
 * It combines the application kind and owner type as `{applicationKind}:{ownerType}`
 * (for example `integration:user` or `sales_channel:guest`).
 */
export type TokenType = `${ApplicationKind}:${OwnerType}`

/**
 * Supported application kinds extracted from Commerce Layer JWT payloads.
 */
type ApplicationKind = Extract<
  CommerceLayerJWT["payload"],
  { application: { kind: string } }
>["application"]["kind"]

/**
 * Supported owner types extracted from Commerce Layer JWT payloads.
 *
 * The value is normalized to lowercase, and includes `guest` for tokens that
 * do not have an owner.
 */
type OwnerType =
  | Lowercase<
      NonNullable<
        Extract<
          CommerceLayerJWT["payload"],
          { owner?: { type: string } }
        >["owner"]
      >["type"]
    >
  | "guest"
