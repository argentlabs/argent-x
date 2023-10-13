import { atomWithStorage } from "jotai/utils"

export const hasSavedRecoverySeedphraseAtom = atomWithStorage(
  "hasSavedRecoverySeedphrase",
  false,
  undefined,
  {
    unstable_getOnInit: true,
  },
)
