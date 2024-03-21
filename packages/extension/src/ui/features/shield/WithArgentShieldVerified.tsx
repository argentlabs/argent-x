import { AlertDialog, useToast } from "@argent/x-ui"
import { Skeleton, VStack } from "@chakra-ui/react"
import { useAtom } from "jotai"
import { isArray } from "lodash-es"
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Call } from "starknet"

import { guardianSignerNotRequired } from "../../../shared/shield/GuardianSignerArgentX"
import { resetDevice } from "../../../shared/shield/jwt"
import { getVerifiedEmailIsExpiredForRemoval } from "../../../shared/shield/verifiedEmail"
import { coerceErrorToString } from "../../../shared/utils/error"

import { argentAccountService } from "../../services/argentAccount"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { ArgentAccountBaseEmailScreen } from "../argentAccount/ArgentAccountBaseEmailScreen"
import { ShieldBaseOTPScreen } from "./ShieldBaseOTPScreen"
import { shieldStateAtom } from "./shield.state"
import { useAccountGuardianIsSelf } from "./useAccountGuardian"
import {
  ChangeGuardian,
  changeGuardianCallDataToType,
} from "./usePendingChangingGuardian"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"
import { IS_DEV } from "../../../shared/utils/dev"

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

interface PropsWithTransactions extends PropsWithChildren {
  /** if provided transactions, check if it is remove guardian as this also affects expiry check  */
  transactions?: Call | Call[]
}

export const WithArgentShieldVerified: FC<PropsWithTransactions> = ({
  children,
  transactions,
}) => {
  return (
    <WithArgentShieldVerifiedScreen transactions={transactions}>
      {children}
    </WithArgentShieldVerifiedScreen>
  )
}

const WithArgentShieldVerifiedScreen: FC<PropsWithTransactions> = ({
  children,
  transactions,
}) => {
  // TODO: refactor all this logic into service and pass only clean state into React
  // this flag prevents the expiry flow re-triggering on internal state change
  const isTokenExpiryFlow = useRef(false)

  const [shieldState, setShieldState] = useAtom(shieldStateAtom)
  const { unverifiedEmail } = shieldState
  const account = useView(selectedAccountView)

  const verifiedEmail = useShieldVerifiedEmail()
  const hasGuardian = Boolean(account?.guardian)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  const toast = useToast()

  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const [state, setState] = useState(
    hasGuardian
      ? ArgentShieldVerifiedState.INITIALISING
      : ArgentShieldVerifiedState.NOT_REQUIRED,
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
      const type = changeGuardianCallDataToType(transactions)
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
    setShieldState({ unverifiedEmail: undefined })
  }, [setShieldState])

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

  const onEmailRequested = useCallback(
    (email: string) => {
      setShieldState({ unverifiedEmail: email })
      setState(ArgentShieldVerifiedState.VERIFY_OTP)
    },
    [setShieldState],
  )

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
    void (async () => {
      if (hasGuardian) {
        if (cosignNotRequired || accountGuardianIsSelf) {
          setState(ArgentShieldVerifiedState.NOT_REQUIRED)
        } else if (verifiedEmail === null) {
          /** still retreiving email */
        } else if (verifiedEmail === undefined) {
          if (unverifiedEmail) {
            // restore ui state to OTP screen rather than email
            setState(ArgentShieldVerifiedState.VERIFY_OTP)
          } else {
            // ignore unwanted state transitions caused by unverifiedEmail/verifiedEmail not yet propagated
            // TODO: refactor - this could potentially be improved with a combination of 'loading' states and possibly XState machine
            if (
              ![
                ArgentShieldVerifiedState.VERIFY_OTP,
                ArgentShieldVerifiedState.VERIFIED,
                ArgentShieldVerifiedState.USER_ABORTED,
              ].includes(state)
            ) {
              // need to ask for and verify email
              setState(ArgentShieldVerifiedState.VERIFY_EMAIL)
            }
          }
        } else {
          const isTokenExpired = isRemoveGuardian
            ? await getVerifiedEmailIsExpiredForRemoval()
            : await argentAccountService.isTokenExpired()
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
              setShieldState({ unverifiedEmail: verifiedEmail })
              // need to use immediate local copy too
              const _unverifiedEmail = verifiedEmail
              await resetDevice()
              await argentAccountService.requestEmail(_unverifiedEmail)
              onEmailRequested(_unverifiedEmail)
            } catch (error) {
              // user can navigate back to re-enter their email
              IS_DEV && console.warn(coerceErrorToString(error))
              toast({
                title: "Unable to verify email",
                status: "error",
                duration: 3000,
              })
            } finally {
              isTokenExpiryFlow.current = false
            }
          } else {
            setState(ArgentShieldVerifiedState.VERIFIED)
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
    setShieldState,
    state,
    toast,
    unverifiedEmail,
    verifiedEmail,
  ])

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
          <ArgentAccountBaseEmailScreen
            onCancel={onEmailCancel}
            onEmailRequested={onEmailRequested}
            flow="shield"
          />
        </>
      )
    case ArgentShieldVerifiedState.VERIFY_OTP:
      return (
        <ShieldBaseOTPScreen
          onBack={() => void onResetEmailRequest()}
          email={unverifiedEmail}
          onOTPReEnterEmail={() => void onResetEmailRequest()}
          onOTPConfirmed={onOTPConfirmed}
        />
      )
    case ArgentShieldVerifiedState.NOT_REQUIRED:
    case ArgentShieldVerifiedState.VERIFIED:
    case ArgentShieldVerifiedState.USER_ABORTED:
      return <>{children}</>
    default:
      state satisfies never
  }
}
