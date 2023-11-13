import { isEqual } from "lodash-es"
import type { IRepositoryOptions } from "./interface"

interface OptionFunctions<T> {
  compareFn?: (a: T, b: T) => boolean
  mergeFn?: (a: T, b: T) => T
}

function getDefaultOptionFunctions<T>(
  options: OptionFunctions<T>,
): Required<OptionFunctions<T>> {
  return {
    compareFn: isEqual,
    mergeFn: (_: T, b: T) => b,
    ...options,
  }
}

function uniqWithMerge<T>(array: T[], options: OptionFunctions<T> = {}): T[] {
  const { compareFn, mergeFn } = getDefaultOptionFunctions(options)

  return array.reduce((result: T[], element: T) => {
    if (!result.some((e) => compareFn(e, element))) {
      return [...result, element]
    }
    return result.map((e) => (compareFn(e, element) ? mergeFn(e, element) : e))
  }, [])
}

export function mergeArrayStableWith<T>(
  source: T[],
  other: T[],
  options: OptionFunctions<T> & {
    insertMode?: "unshift" | "push"
  } = {},
): T[] {
  const { compareFn, mergeFn } = getDefaultOptionFunctions(options)
  const insertMode = options.insertMode ?? "push"

  const result = uniqWithMerge(source, options)
  return other.reduce((acc: T[], element: T) => {
    const index = acc.findIndex((e) => compareFn(e, element))
    if (index === -1) {
      return insertMode === "unshift" ? [element, ...acc] : [...acc, element]
    } else {
      return [
        ...acc.slice(0, index),
        mergeFn(acc[index], element),
        ...acc.slice(index + 1),
      ]
    }
  }, result)
}

export function optionsWithDefaults<T, O extends IRepositoryOptions<T>>(
  options: O,
): Required<IRepositoryOptions<T>> & O {
  const passThrough = <T>(value: T) => value
  const compare = (a: T, b: T) => a === b
  const merge = (_: T, b: T) => b

  return {
    defaults: [],
    serialize: passThrough,
    deserialize: passThrough,
    compare,
    merge,
    ...options,
  }
}
