/**
 * This file should probably be contributed to type-fest
 */

import type { Simplify, UnionToIntersection } from "type-fest"

type DeepPath<
  T,
  Depth extends number = 5,
  CurrentDepth extends number[] = [],
> = CurrentDepth["length"] extends Depth
  ? never
  : T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends Record<string, any>
        ?
            | K
            | `${Extract<K, string>}.${DeepPath<
                T[K],
                Depth,
                [...CurrentDepth, 0]
              >}`
        : K
    }[keyof T]
  : never

export type DeepPick<
  T,
  K extends DeepPath<T>,
  Depth extends number = 5,
> = Simplify<
  UnionToIntersection<
    {
      [P in K]: P extends `${infer A}.${infer R}`
        ? A extends keyof T
          ? { [K in A]: DeepPick<T[A], Extract<R, DeepPath<T[A], Depth>>> }
          : never
        : P extends keyof T
        ? { [K in P]: T[P] }
        : never
    }[K]
  >
>
