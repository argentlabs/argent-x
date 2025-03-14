import type { Atom } from "jotai"

export const atomWithDebugLabel = <AtomType extends Atom<unknown>>(
  atomToLabel: AtomType,
  label: string,
) => {
  atomToLabel.debugLabel = label
  return atomToLabel
}
