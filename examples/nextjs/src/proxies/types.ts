import type { NextProxy } from "next/server"

export type WithProxy = (next?: NextProxy) => NextProxy