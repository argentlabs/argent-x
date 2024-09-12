import {
  BarBackButton,
  FlowHeader,
  NavigationContainer,
  iconsDeprecated,
} from "@argent/x-ui"

import { FC, useCallback, useState } from "react"

import { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import { useRouteFlow } from "../../hooks/useRoute"
import SmartAccountOTPForm from "./SmartAccountOTPForm"
import { SmartAccountValidationErrorScreen } from "./SmartAccountValidationErrorScreen"

const { EmailIcon } = iconsDeprecated

export interface SmartAccountBaseOTPScreenProps {
  onBack: () => void
  email?: string
  onOTPReEnterEmail: () => void
  onOTPConfirmed: () => void
}

export const SmartAccountBaseOTPScreen: FC<SmartAccountBaseOTPScreenProps> = ({
  onBack,
  email,
  onOTPReEnterEmail,
  onOTPConfirmed,
}) => {
  const [smartAccountValdationError, setSmartAccountValdationError] =
    useState<SmartAccountValidationErrorMessage | null>(null)
  const flow = useRouteFlow()
  const onSmartAccountValdationErrorDone = useCallback(() => {
    onOTPReEnterEmail()
  }, [onOTPReEnterEmail])

  if (smartAccountValdationError) {
    return (
      <SmartAccountValidationErrorScreen
        onBack={onBack}
        error={smartAccountValdationError}
        onDone={onSmartAccountValdationErrorDone}
      />
    )
  }

  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : null}
    >
      <FlowHeader
        icon={EmailIcon}
        title={"Check your email"}
        subtitle={`We’ve sent a verification code to ${email}`}
      />
      <SmartAccountOTPForm
        email={email}
        onOTPReEnterEmail={onOTPReEnterEmail}
        onOTPConfirmed={onOTPConfirmed}
        onValidationError={setSmartAccountValdationError}
        flow={flow}
      />
    </NavigationContainer>
  )
}
