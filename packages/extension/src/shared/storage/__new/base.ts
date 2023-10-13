import type { IRepositoryOptions } from "./interface"

export function uniqWithRight<T>(
  array: T[],
  compareFn: (a: T, b: T) => boolean,
): T[] {
  return array.reduceRight((result: T[], element: T) => {
    if (!result.some((e) => compareFn(e, element))) {
      return [element, ...result]
    }
    return result
  }, [])
}

export function mergeArrayStableWith<T>(
  source: T[],
  other: T[],
  compareFn: (a: T, b: T) => boolean,
  insertMode: "unshift" | "push" = "push",
): T[] {
  const result = uniqWithRight(source, compareFn)
  return other.reduceRight((acc: T[], element: T) => {
    const index = acc.findIndex((e) => compareFn(e, element))
    if (index === -1) {
      return insertMode === "push" ? [element, ...acc] : [...acc, element]
    } else {
      return [...acc.slice(0, index), element, ...acc.slice(index + 1)]
    }
  }, result)
}

export function optionsWithDefaults<T, O extends IRepositoryOptions<T>>(
  options: O,
): Required<IRepositoryOptions<T>> & O {
  const passThrough = <T>(value: T) => value
  const compare = (a: T, b: T) => a === b
  return {
    defaults: [],
    serialize: passThrough,
    deserialize: passThrough,
    compare,
    ...options,
  }
}
