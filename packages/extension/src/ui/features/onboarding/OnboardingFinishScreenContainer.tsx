import type { FC } from "react"
import { useEffect } from "react"
import { OnboardingFinishScreen } from "./OnboardingFinishScreen"
import { lastLegalAgreementTimestampAtom } from "../legal/legalStorage"
import { useAtom } from "jotai"
import { useView } from "../../views/implementation/react"
import { selectedAccountView } from "../../views/account"

export const OnboardingFinishScreenContainer: FC = () => {
  const selectedAccount = useView(selectedAccountView)
  const [, setLastLegalAgreementTimestamp] = useAtom(
    lastLegalAgreementTimestampAtom,
  )

  useEffect(() => {
    // user implicity agrees to terms right now
    setLastLegalAgreementTimestamp(Date.now())
  }, [setLastLegalAgreementTimestamp])

  const isSmart = selectedAccount?.type === "smart"
  return <OnboardingFinishScreen isSmart={isSmart} />
}
