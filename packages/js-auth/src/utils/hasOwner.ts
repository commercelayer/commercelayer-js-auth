import type { CommerceLayerJWT, JWTOrganizationBase } from "src/jwtDecode.js"

/**
 * Checks if the payload contains an owner field, which indicates that it is a customer token.
 */
export function hasOwner(
  payload: CommerceLayerJWT["payload"],
): payload is PayloadWithOwner {
  return "owner" in payload && payload.owner?.id != null
}

type PayloadWithOwner = Extract<
  CommerceLayerJWT["payload"],
  JWTOrganizationBase
> & {
  owner: NonNullable<JWTOrganizationBase["owner"]>
}
