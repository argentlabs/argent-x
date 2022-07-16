import { isFunction, isObjectLike, isPlainObject } from "lodash-es"

import { Config } from "./types"

const identity = (value: unknown) => value

export function parseConfig(config: Config) {
  if (!isPlainObject(config)) {
    throw new Error("Config is required")
  }

  const storage = config.storage

  if (
    !isObjectLike(storage) ||
    !isFunction(storage.get) ||
    !isFunction(storage.set)
  ) {
    throw new Error(
      'Storage is required and should satisfy the Config["storage"] type',
    )
  }

  const minTimeToStale = config.minTimeToStale || 0
  const maxTimeToLive =
    Math.min(config.maxTimeToLive ?? 0, Number.MAX_SAFE_INTEGER) || Infinity
  const serialize = isFunction(config.serialize) ? config.serialize : identity
  const deserialize = isFunction(config.deserialize)
    ? config.deserialize
    : identity

  if (minTimeToStale >= maxTimeToLive) {
    throw new Error("minTimeToStale must be less than maxTimeToLive")
  }

  return {
    storage,
    minTimeToStale,
    maxTimeToLive,
    serialize,
    deserialize,
  }
}
