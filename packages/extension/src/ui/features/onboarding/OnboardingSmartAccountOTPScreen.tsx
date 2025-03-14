import type { FC } from "react"

import type { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import SmartAccountOTPForm from "../smartAccount/SmartAccountOTPForm"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { defaultNetwork } from "../../../shared/network"

interface OnboardingSmartAccountOTPScreenProps {
  email: string
  onReEnterEmail: () => void
  onOTPConfirmed: () => void
  setSmartAccountValidationError: (
    error: SmartAccountValidationErrorMessage | null,
  ) => void
}

export const OnboardingSmartAccountOTPScreen: FC<
  OnboardingSmartAccountOTPScreenProps
> = ({
  email,
  onReEnterEmail,
  onOTPConfirmed,
  setSmartAccountValidationError,
}) => {
  return (
    <OnboardingScreen
      onBack={onReEnterEmail}
      length={5}
      currentIndex={3}
      title="Check your email"
      subtitle={`We've sent a verification code to ${email}`}
      illustration="email"
    >
      <SmartAccountOTPForm
        email={email}
        onOTPReEnterEmail={onReEnterEmail}
        onOTPConfirmed={onOTPConfirmed}
        onValidationError={setSmartAccountValidationError}
        flow="createSmartAccount"
        pinInputWidth={18}
        networkId={defaultNetwork.id}
      />
    </OnboardingScreen>
  )
}
