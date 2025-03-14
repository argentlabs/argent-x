import { AlertDialog, useToast } from "@argent/x-ui"
import { useAtom } from "jotai"
import { isArray } from "lodash-es"
import type { FC, PropsWithChildren, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Call } from "starknet"

import { resetDevice } from "../../../shared/smartAccount/jwt"
import { getVerifiedEmailIsExpiredForRemoval } from "../../../shared/smartAccount/verifiedEmail"
import { coerceErrorToString } from "../../../shared/utils/error"

import { clientArgentAccountService } from "../../services/argentAccount"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"
import { SmartAccountBaseOTPScreen } from "./SmartAccountBaseOTPScreen"
import { smartAccountStateAtom } from "./smartAccount.state"
import { useAccountGuardianIsSelf } from "./useAccountGuardian"
import {
  ChangeGuardian,
  changeGuardianTransactionsToType,
} from "../../../shared/smartAccount/changeGuardianCallDataToType"
import { useSmartAccountVerifiedEmail } from "./useSmartAccountVerifiedEmail"
import { IS_DEV } from "../../../shared/utils/dev"
import { guardianSignerNotRequired } from "../../../shared/signer/GuardianSignerV2"
import { ScreenSkeleton } from "../../components/ScreenSkeleton"

enum SmartAccountVerifiedState {
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

interface WithSmartAccountVerifiedProps extends PropsWithChildren {
  /** if provided transactions, check if it is remove guardian as this also affects expiry check  */
  transactions?: Call | Call[]
  fallback?: ReactNode
}

export const WithSmartAccountVerified: FC<WithSmartAccountVerifiedProps> = ({
  children,
  transactions,
  fallback = <ScreenSkeleton list />,
}) => {
  // TODO: refactor all this logic into service and pass only clean state into React
  // this flag prevents the expiry flow re-triggering on internal state change
  const isTokenExpiryFlow = useRef(false)

  const [smartAccountState, setSmartAccountState] = useAtom(
    smartAccountStateAtom,
  )
  const { unverifiedEmail } = smartAccountState
  const account = useView(selectedAccountView)

  const verifiedEmail = useSmartAccountVerifiedEmail()
  const hasGuardian = Boolean(account?.guardian)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  const toast = useToast()

  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const [state, setState] = useState(
    hasGuardian
      ? SmartAccountVerifiedState.INITIALISING
      : SmartAccountVerifiedState.NOT_REQUIRED,
  )

  // check if it is remove guardian

  const calls = useMemo(
    () => (isArray(transactions) ? transactions : [transactions]),
    [transactions],
  )

  const isRemoveGuardian = useMemo(() => {
    if (
      ["changeGuardian", "change_guardian"].includes(
        calls?.[0]?.entrypoint || "",
      )
    ) {
      const type = changeGuardianTransactionsToType(transactions)
      return type === ChangeGuardian.REMOVING
    }
    return false
  }, [calls, transactions])

  const cosignNotRequired = useMemo(() => {
    return calls.find((call) => {
      return (
        call?.entrypoint && guardianSignerNotRequired.includes(call.entrypoint)
      )
    })
  }, [calls])

  const resetUnverifiedEmail = useCallback(() => {
    setSmartAccountState({ unverifiedEmail: undefined })
  }, [setSmartAccountState])

  // email actions

  const onAlertDialogCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  const onAlertDialogConfirm = useCallback(() => {
    setAlertDialogIsOpen(false)
    resetUnverifiedEmail()
    setState(SmartAccountVerifiedState.USER_ABORTED)
  }, [resetUnverifiedEmail])

  const onEmailCancel = useCallback(() => {
    setAlertDialogIsOpen(true)
  }, [])

  const onEmailRequested = useCallback(
    (email: string) => {
      setSmartAccountState({ unverifiedEmail: email })
      setState(SmartAccountVerifiedState.VERIFY_OTP)
    },
    [setSmartAccountState],
  )

  // otp actions

  const onResetEmailRequest = useCallback(async () => {
    await resetDevice()
    resetUnverifiedEmail()
    setState(SmartAccountVerifiedState.VERIFY_EMAIL)
  }, [resetUnverifiedEmail])

  const onOTPConfirmed = useCallback(() => {
    resetUnverifiedEmail()
    setState(SmartAccountVerifiedState.VERIFIED)
  }, [resetUnverifiedEmail])

  // update state

  useEffect(() => {
    void (async () => {
      if (hasGuardian) {
        if (cosignNotRequired || accountGuardianIsSelf) {
          setState(SmartAccountVerifiedState.NOT_REQUIRED)
        } else if (verifiedEmail === null) {
          /** still retreiving email */
        } else if (verifiedEmail === undefined) {
          if (unverifiedEmail) {
            // restore ui state to OTP screen rather than email
            setState(SmartAccountVerifiedState.VERIFY_OTP)
          } else {
            // ignore unwanted state transitions caused by unverifiedEmail/verifiedEmail not yet propagated
            // TODO: refactor - this could potentially be improved with a combination of 'loading' states and possibly XState machine
            if (
              ![
                SmartAccountVerifiedState.VERIFY_OTP,
                SmartAccountVerifiedState.VERIFIED,
                SmartAccountVerifiedState.USER_ABORTED,
              ].includes(state)
            ) {
              // need to ask for and verify email
              setState(SmartAccountVerifiedState.VERIFY_EMAIL)
            }
          }
        } else {
          if (state === SmartAccountVerifiedState.VERIFIED) {
            return
          }
          const isTokenExpired = isRemoveGuardian
            ? await getVerifiedEmailIsExpiredForRemoval()
            : await clientArgentAccountService.isTokenExpired({
                initiator: "WithSmartAccountVerified/useEffect",
              })
          if (isTokenExpired) {
            // this ref guards against this flow re-running and sending > 1 emails
            if (isTokenExpiryFlow.current) {
              return
            }
            isTokenExpiryFlow.current = true
            // need to re-verify existing email
            try {
              // reflect unverifiedEmail in overall state
              // the isTokenExpiryFlow ref guards against this state change
              // triggering this flow again before completion
              setSmartAccountState({ unverifiedEmail: verifiedEmail })
              // need to use immediate local copy too
              const _unverifiedEmail = verifiedEmail
              await resetDevice()
              await clientArgentAccountService.requestEmail(_unverifiedEmail)
              onEmailRequested(_unverifiedEmail)
            } catch (error) {
              // user can navigate back to re-enter their email
              if (IS_DEV) {
                console.warn(coerceErrorToString(error))
              }
              toast({
                title: "Unable to verify email",
                status: "error",
                duration: 3000,
              })
            } finally {
              isTokenExpiryFlow.current = false
            }
          } else {
            setState(SmartAccountVerifiedState.VERIFIED)
          }
        }
      }
    })()
  }, [
    accountGuardianIsSelf,
    cosignNotRequired,
    hasGuardian,
    isRemoveGuardian,
    onEmailRequested,
    setSmartAccountState,
    state,
    toast,
    unverifiedEmail,
    verifiedEmail,
  ])

  switch (state) {
    case SmartAccountVerifiedState.INITIALISING:
      return fallback
    case SmartAccountVerifiedState.VERIFY_EMAIL:
      return (
        <>
          <AlertDialog
            isOpen={alertDialogIsOpen}
            title={"Smart Account Verification Required"}
            message={
              "This account is protected by Argent as a guardian and cannot sign transactions or estimate fees without 2FA"
            }
            cancelTitle={"Abort 2FA"}
            onCancel={onAlertDialogConfirm}
            confirmTitle={"Continue"}
            onConfirm={onAlertDialogCancel}
          />
          <ArgentAccountBaseEmailScreen
            onCancel={onEmailCancel}
            onEmailRequested={onEmailRequested}
            flow="toggleSmartAccount"
          />
        </>
      )
    case SmartAccountVerifiedState.VERIFY_OTP:
      return (
        <SmartAccountBaseOTPScreen
          onBack={() => void onResetEmailRequest()}
          email={unverifiedEmail}
          onOTPReEnterEmail={() => void onResetEmailRequest()}
          onOTPConfirmed={onOTPConfirmed}
        />
      )
    case SmartAccountVerifiedState.NOT_REQUIRED:
    case SmartAccountVerifiedState.VERIFIED:
    case SmartAccountVerifiedState.USER_ABORTED:
      return <>{children}</>
    default:
      state satisfies never
  }
}
