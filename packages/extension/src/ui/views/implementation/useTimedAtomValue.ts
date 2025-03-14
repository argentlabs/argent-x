import {
  type Atom,
  atom,
  type useStore,
  type ExtractAtomValue,
  useAtomValue,
} from "jotai"
import memoize from "memoizee"

const timedAtomRaw = <AtomType extends Atom<unknown>>(atomToTime: AtomType) => {
  if (!atomToTime.debugLabel) {
    console.warn(
      "atom is missing debugLabel - break in debugger to fix",
      atomToTime,
    )
    // debugger
  }
  return atom(async (get) => {
    const startTime = performance.now()
    const result = await get(atomToTime)
    const executionTime = performance.now() - startTime
    const stableExecutionTime = executionTime.toFixed(5).padStart(11)
    console.log(
      Number(stableExecutionTime) > 10
        ? `\x1b[31m${stableExecutionTime}\x1b[0m`
        : stableExecutionTime,
      `${atomToTime.debugLabel ?? "no-label"}`,
    )
    return result
  })
}
const timedAtom = memoize(timedAtomRaw)
type Options = Parameters<typeof useStore>[0] & {
  delay?: number
}

export function useTimedAtomValue<Value>(
  atom: Atom<Value>,
  options?: Options,
): Awaited<Value>

export function useTimedAtomValue<AtomType extends Atom<unknown>>(
  atom: AtomType,
  options?: Options,
): Awaited<ExtractAtomValue<AtomType>>

export function useTimedAtomValue<Value>(
  atomToTime: Atom<Value>,
  options?: Options,
) {
  return useAtomValue(timedAtom(atomToTime), options)
}
