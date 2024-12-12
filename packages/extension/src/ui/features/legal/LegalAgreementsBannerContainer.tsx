import { useAtom } from "jotai"
import type { FC } from "react"

import { LegalAgreementsBanner } from "./LegalAgreementsBanner"
import { lastLegalAgreementTimestampAtom } from "./legalStorage"

export const LegalAgreementsBannerContainer: FC = () => {
  const [lastLegalAgreementTimestamp, setLastLegalAgreementTimestamp] = useAtom(
    lastLegalAgreementTimestampAtom,
  )
  // TODO: in future this could be compared against the 'updatedAt' of the legal agreements
  const shouldShowLegalAgreement = lastLegalAgreementTimestamp === 0
  const onAgree = () => {
    setLastLegalAgreementTimestamp(Date.now())
  }
  if (!shouldShowLegalAgreement) {
    return null
  }
  return <LegalAgreementsBanner onAgree={onAgree} />
}
