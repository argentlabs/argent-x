import { MessageSecondaryIcon } from "@argent/x-ui/icons"
import { BarBackButton, FlowHeader, NavigationContainer } from "@argent/x-ui"

import type { FC } from "react"
import { useCallback, useState } from "react"

import type { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import { useRouteFlow } from "../../hooks/useRoute"
import SmartAccountOTPForm from "./SmartAccountOTPForm"
import { SmartAccountValidationErrorScreen } from "./SmartAccountValidationErrorScreen"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

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

  const network = useCurrentNetwork()

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
        icon={MessageSecondaryIcon}
        title={"Check your email"}
        subtitle={`We’ve sent a verification code to ${email}`}
      />
      <SmartAccountOTPForm
        email={email}
        onOTPReEnterEmail={onOTPReEnterEmail}
        onOTPConfirmed={onOTPConfirmed}
        onValidationError={setSmartAccountValdationError}
        flow={flow}
        networkId={network.id}
      />
    </NavigationContainer>
  )
}
