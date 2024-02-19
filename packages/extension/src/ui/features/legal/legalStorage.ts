import { atomWithStorage } from "jotai/utils"

export const lastLegalAgreementTimestampAtom = atomWithStorage(
  "lastLegalAgreementTimestamp",
  0,
)
