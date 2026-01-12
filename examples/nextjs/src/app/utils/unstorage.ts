import type { Storage } from "@commercelayer/js-auth"
import {
  type CreateStorageOptions,
  createStorage as unstorageCreateStorage,
} from "unstorage"

export function createStorage(
  options: CreateStorageOptions & { name?: string },
): Storage {
  return {
    name: options.name ?? options.driver?.name,
    ...unstorageCreateStorage(options),
  }
}

export { default as localstorageDriver } from "unstorage/drivers/localstorage"
export { default as memoryDriver } from "unstorage/drivers/memory"
export { default as redisDriver } from "unstorage/drivers/redis"
