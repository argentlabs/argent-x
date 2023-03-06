import { AlertDialog } from "@argent/ui"
import { Skeleton, VStack } from "@chakra-ui/react"
import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ARGENT_SHIELD_ENABLED } from "../../../shared/shield/constants"
import { resetDevice } from "../../../shared/shield/jwt"
import {
  requestEmail,
  shieldIsTokenExpired,
} from "../../../shared/shield/register"
import { useSelectedAccount } from "../accounts/accounts.state"
import { WithArgentServicesEnabled } from "../settings/WithArgentServicesEnabled"
import { useShieldState } from "./shield.state"
import { ShieldBaseEmailScreen } from "./ShieldBaseEmailScreen"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

enum ArgentShieldVerifiedState {
  INITIALISING = "INITIALISING",
  NOT_REQUIRED = "NOT_REQUIRED",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  VERIFY_OTP = "VERIFY_OTP",
  VERIFIED = "VERIFIED",
  USER_ABORTED = "USER_ABORTED",
}

/**
 * Wraps any screen which may need to sign a transaction
 *
 * If the current account has a Guardian, check and handle the email / otp verification flow using local state
 */

export const WithArgentShieldVerified: FC<PropsWithChildren> = ({
  children,
}) => {
  return ARGENT_SHIELD_ENABLED ? (
    <WithArgentServicesEnabled>
      <WithArgentShieldEnabledVerified>
        {children}
      </WithArgentShieldEnabledVerified>
    </WithArgentServicesEnabled>
  ) : (
    <>{children}</>
  )
}

const WithArgentShieldEnabledVerified: FC<PropsWithChildren> = ({
  children,
}) => {
  const unverifiedEmail = useShieldState((state) => state.unverifiedEmail)
  const account = useSelectedAccount()
  const verifiedEmail = useShieldVerifiedEmail()
  const navigate = useNavigate()
  const hasGuardian = Boolean(account?.guardian)
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const [state, setState] = useState(
    hasGuardian
      ? ArgentShieldVerifiedState.INITIALISING
      : ArgentShieldVerifiedState.NOT_REQUIRED,
  )

  const resetUnverifiedEmail = useCallback(() => {
    useShieldState.setState({ unverifiedEmail: undefined })
  }, [])

  // email actions

  const onAlertDialogCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  const onAlertDialogConfirm = useCallback(() => {
    setAlertDialogIsOpen(false)
    resetUnverifiedEmail()
    setState(ArgentShieldVerifiedState.USER_ABORTED)
  }, [resetUnverifiedEmail])

  const onEmailCancel = useCallback(() => {
    setAlertDialogIsOpen(true)
  }, [])

  const onEmailRequested = useCallback((email: string) => {
    useShieldState.setState({ unverifiedEmail: email })
    setState(ArgentShieldVerifiedState.VERIFY_OTP)
  }, [])

  // otp actions

  const onResetEmailRequest = useCallback(async () => {
    await resetDevice()
    resetUnverifiedEmail()
    setState(ArgentShieldVerifiedState.VERIFY_EMAIL)
  }, [resetUnverifiedEmail])

  const onOTPConfirmed = useCallback(() => {
    resetUnverifiedEmail()
    setState(ArgentShieldVerifiedState.VERIFIED)
  }, [resetUnverifiedEmail])

  // update state

  useEffect(() => {
    ;(async () => {
      if (hasGuardian) {
        if (verifiedEmail === null) {
          /** still retreiving email */
        } else if (verifiedEmail === undefined) {
          if (unverifiedEmail) {
            // restore ui state to OTP screen rather than email
            setState(ArgentShieldVerifiedState.VERIFY_OTP)
          } else {
            // need to ask for and verify email
            setState(ArgentShieldVerifiedState.VERIFY_EMAIL)
          }
        } else {
          const isTokenExpired = await shieldIsTokenExpired()
          if (isTokenExpired) {
            // need to re-verify existing email
            await requestEmail(verifiedEmail)
            setState(ArgentShieldVerifiedState.VERIFY_OTP)
          } else {
            setState(ArgentShieldVerifiedState.VERIFIED)
          }
        }
      }
    })()
  }, [hasGuardian, navigate, unverifiedEmail, verifiedEmail])

  switch (state) {
    case ArgentShieldVerifiedState.INITIALISING:
      return (
        <VStack pt={12} px={8} spacing={2} align="stretch">
          <Skeleton height="16" rounded={"xl"} />
          <Skeleton height="16" rounded={"xl"} />
          <Skeleton height="16" rounded={"xl"} />
        </VStack>
      )
    case ArgentShieldVerifiedState.VERIFY_EMAIL:
      return (
        <>
          <AlertDialog
            isOpen={alertDialogIsOpen}
            title={"Argent Shield 2FA"}
            message={
              "This account is protected by Argent Shield and cannot sign transactions or estimate fees without 2FA"
            }
            cancelTitle={"Abort 2FA"}
            onCancel={onAlertDialogConfirm}
            confirmTitle={"Continue"}
            onConfirm={onAlertDialogCancel}
          />
          <ShieldBaseEmailScreen
            onCancel={onEmailCancel}
            onEmailRequested={onEmailRequested}
            hasGuardian={hasGuardian}
          />
        </>
      )
    case ArgentShieldVerifiedState.VERIFY_OTP:
      return (
        <ShieldBaseOTPScreen
          onBack={onResetEmailRequest}
          email={unverifiedEmail}
          onOTPReEnterEmail={onResetEmailRequest}
          onOTPConfirmed={onOTPConfirmed}
        />
      )
    case ArgentShieldVerifiedState.NOT_REQUIRED:
    case ArgentShieldVerifiedState.VERIFIED:
    case ArgentShieldVerifiedState.USER_ABORTED:
      return <>{children}</>
  }
}
