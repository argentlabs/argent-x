import { FC, useCallback, useEffect } from "react"
import { OnboardingFinishScreen } from "./OnboardingFinishScreen"
import { lastLegalAgreementTimestampAtom } from "../legal/legalStorage"
import { useAtom } from "jotai"

export const OnboardingFinishScreenContainer: FC = () => {
  const [, setLastLegalAgreementTimestamp] = useAtom(
    lastLegalAgreementTimestampAtom,
  )

  useEffect(() => {
    // user implicity agrees to terms right now
    setLastLegalAgreementTimestamp(Date.now())
  }, [setLastLegalAgreementTimestamp])

  const onFinish = useCallback(() => {
    // void trackSuccess() // TODO: temporary disabled
    window.close()
  }, [])

  return <OnboardingFinishScreen onFinish={onFinish} />
}
