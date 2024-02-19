import { isNil } from "lodash-es"

export function nonNullable<T>(x: T | null | undefined): x is T {
  return !isNil(x)
}
