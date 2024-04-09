import { FC, useCallback, useEffect } from "react"

// import { useTimeSpentWithSuccessTracking } from "../../services/analytics"
import { OnboardingFinishScreen } from "./OnboardingFinishScreen"
import { lastLegalAgreementTimestampAtom } from "../legal/legalStorage"
import { useAtom } from "jotai"
import { analyticsService } from "../../../shared/analytics"

export const OnboardingFinishScreenContainer: FC = () => {
  useEffect(() => {
    analyticsService.onboardingCompleted({ "account type": "standard" })
  }, [])

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
