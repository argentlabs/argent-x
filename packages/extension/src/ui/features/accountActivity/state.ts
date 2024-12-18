import { atom } from "jotai"
import type { StateSnapshot } from "react-virtuoso"

/** Store scroll state, does not need to persist beyond extension close */
export const virtuosoStateSnapshotAtom = atom<StateSnapshot | undefined>(
  undefined,
)
