import { atomWithStorage } from "jotai/utils"

export const hasSavedRecoverySeedphraseAtom = atomWithStorage(
  "hasSavedRecoverySeedphrase",
  false,
  undefined,
  {
    getOnInit: true,
  },
)
