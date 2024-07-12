import { type NextMiddleware } from 'next/server'

export type WithMiddleware = (next?: NextMiddleware) => NextMiddleware