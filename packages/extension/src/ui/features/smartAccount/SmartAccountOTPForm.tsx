import { getMessageFromTrpcError } from "@argent/x-shared"
import { MessageSecondaryIcon, RefreshPrimaryIcon } from "@argent/x-ui/icons"
import { FieldError, useToast } from "@argent/x-ui"
import { Button, Center, HStack, PinInputField } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FormEvent, MouseEvent } from "react"
import { useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { accountSharedService } from "../../../shared/account/service"
import { ampli } from "../../../shared/analytics"
import type { Flow } from "../../../shared/argentAccount/schema"
import type { SmartAccountValidationErrorMessage } from "../../../shared/errors/argentAccount"
import { browserExtensionSentryWithScope } from "../../../shared/sentry/scope"
import type { EmailVerificationStatus } from "../../../shared/smartAccount/backend/account"
import {
  emailVerificationStatusErrorSchema,
  getVerificationErrorMessage,
} from "../../../shared/smartAccount/backend/account"
import { getAddBackendAccountErrorFromBackendError } from "../../../shared/smartAccount/validation/addBackendAccount"
import { getSmartAccountValidationErrorFromBackendError } from "../../../shared/smartAccount/validation/validateAccount"
import { getVerificationErrorFromBackendError } from "../../../shared/smartAccount/validation/verification"
import { updateVerifiedEmail } from "../../../shared/smartAccount/verifiedEmail"
import { coerceErrorToString } from "../../../shared/utils/error"
import { SignerType } from "../../../shared/wallet.model"
import { ControlledPinInput } from "../../components/ControlledPinInput"
import { useAction } from "../../hooks/useAction"
import { clientAccountService } from "../../services/account"
import { clientArgentAccountService } from "../../services/argentAccount"

const schema = z.object({
  otp: z
    .string()
    .regex(/^[0-9]{6}$/, "Must be 6 digits")
    .min(1, "Passcode is required"),
})

interface SmartAccountOTPFormProps {
  email?: string
  onOTPReEnterEmail: () => void
  onOTPConfirmed: () => void
  onValidationError: (error: SmartAccountValidationErrorMessage) => void
  flow: Flow
  pinInputWidth?: number
  networkId: string
}

const errorSchema = z.object({
  message: z.string(),
})

const getMessageFromError = (error: unknown) => {
  const parsed = errorSchema.safeParse(error)
  if (!parsed.success) {
    return
  }
  return parsed.data.message
}

const SmartAccountOTPForm = (props: SmartAccountOTPFormProps) => {
  const {
    email,
    onOTPReEnterEmail,
    onOTPConfirmed,
    onValidationError,
    flow,
    pinInputWidth,
    networkId,
  } = props

  const formRef = useRef<HTMLFormElement>(null)
  const toast = useToast()

  const { action: addAccount } = useAction(
    clientAccountService.create.bind(clientAccountService),
  )
  const onResendEmail = useCallback(
    async (e: MouseEvent) => {
      e.preventDefault()
      if (!email) {
        return
      }
      try {
        await clientArgentAccountService.requestEmail(email)
        toast({
          icon: <MessageSecondaryIcon />,
          title: "A new code has been sent to your email",
          status: "info",
          duration: 3000,
        })
        ampli.onboardingVerificationCodeResent({
          "wallet platform": "browser extension",
        })
      } catch (error) {
        console.warn(coerceErrorToString(error))
        toast({
          title: "Unable to verify email",
          status: "error",
          duration: 3000,
        })
      }
    },
    [email, toast],
  )

  const { handleSubmit, formState, setError, control } = useForm({
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(schema),
  })

  const handleSubmitError = useCallback(
    (e: unknown) => {
      /** OTP verification error */
      const verificationError = getVerificationErrorFromBackendError(e)
      if (verificationError) {
        return setError("otp", {
          type: "manual",
          message: verificationError,
        })
      }

      /** Email validation error */
      const smartAccountValidationError =
        getSmartAccountValidationErrorFromBackendError(e)
      if (smartAccountValidationError) {
        return onValidationError(smartAccountValidationError)
      }

      /** Add account error */
      const addBackendAccountError =
        getAddBackendAccountErrorFromBackendError(e)
      if (addBackendAccountError) {
        return setError("otp", {
          type: "manual",
          message: addBackendAccountError,
        })
      }

      /** Other possible error status from backend */
      try {
        const errorObject = errorSchema.parse(e)
        try {
          const error = emailVerificationStatusErrorSchema.safeParse(
            JSON.parse(errorObject.message),
          )
          if (error.success) {
            if (error.data.responseJson.status === "notRequested") {
              /** need to start verification over again */
              toast({
                title: "Please re-enter email",
                status: "error",
                duration: 3000,
              })
              onOTPReEnterEmail()
            } else {
              return setError("otp", {
                type: "manual",
                message: getVerificationErrorMessage(
                  error.data.responseJson.status as EmailVerificationStatus,
                ),
              })
            }
          } else {
            /** if parsing the json fails, re-throw the original error */
            throw e
          }
        } catch {
          /** if parsing as json fails, re-throw the original error */
          throw e
        }
      } catch (e) {
        /** capture unhandled original error in Sentry */
        console.error(e)
        browserExtensionSentryWithScope((scope) => {
          scope.setLevel("warning")
          scope.captureException(
            new Error("SmartAccountOTPForm error: ", { cause: e }),
          )
        })
      }
      /** Try to show the error message to the user */
      const trpcMessage = getMessageFromTrpcError(e)
      const errorMessage = getMessageFromError(e)
      const message = trpcMessage || errorMessage
      return setError("otp", {
        type: "manual",
        message: `Unknown error - please try again later${message ? ` (${message})` : ""}`,
      })
    },
    [onOTPReEnterEmail, onValidationError, setError, toast],
  )

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      void handleSubmit(async ({ otp }) => {
        try {
          await clientArgentAccountService.confirmEmail(otp)
          //TODO there is an error here if you use another email than the registeres one
          /** always check the account can be used and exists in backend */
          await clientArgentAccountService.validateAccount(flow)

          if (flow === "toggleSmartAccount") {
            await clientArgentAccountService.addGuardianToAccount()
          } else if (flow === "createSmartAccount") {
            await addAccount("smart", SignerType.LOCAL_SECRET, networkId)
          }

          //TODO; trigger here the salt update for all accounts in storage
          /** successfully verifified and added account with backend - persist this email in the local db */
          await updateVerifiedEmail(email)

          // Make sure that we resync all account names with backend
          await accountSharedService.syncAccountNamesWithBackend()

          // Make /account call, to update amplitude
          await clientArgentAccountService.isTokenExpired({
            initiator: "SmartAccountOTPForm/onSubmit",
          })

          // Only trigger this event if the account was successfully validated
          ampli.onboardingVerificationCodeAccepted({
            "wallet platform": "browser extension",
          })

          onOTPConfirmed()
        } catch (e) {
          // Verification code rejected even if otp is correct but account validation failed
          ampli.onboardingVerificationCodeRejected({
            "wallet platform": "browser extension",
          })

          handleSubmitError(e)
        }
      })(e)
    },
    [
      addAccount,
      email,
      flow,
      handleSubmit,
      handleSubmitError,
      networkId,
      onOTPConfirmed,
    ],
  )

  return (
    <Center flexDirection={"column"}>
      <Center>
        <form ref={formRef} onSubmit={onSubmit}>
          <HStack spacing={1.5}>
            <ControlledPinInput
              control={control}
              name="otp"
              autoFocus
              type="number"
              placeholder=""
              isDisabled={formState.isSubmitting}
              onComplete={() => {
                formRef.current?.requestSubmit()
              }}
            >
              <PinInputField w={pinInputWidth} />
              <PinInputField w={pinInputWidth} />
              <PinInputField w={pinInputWidth} />
              <PinInputField w={pinInputWidth} />
              <PinInputField w={pinInputWidth} />
              <PinInputField w={pinInputWidth} />
            </ControlledPinInput>
          </HStack>
        </form>
      </Center>
      {formState.errors.otp?.message && (
        <FieldError px={4} mt={4} textAlign={"center"}>
          {formState.errors.otp?.message}
        </FieldError>
      )}
      <Center flexDirection={"column"}>
        <Button
          mt={8}
          onClick={(e) => void onResendEmail(e)}
          size="2xs"
          colorScheme="transparent"
          color="neutrals.400"
          leftIcon={<RefreshPrimaryIcon />}
          isLoading={formState.isSubmitting}
          loadingText={"Verifying"}
        >
          Resend code
        </Button>
      </Center>
    </Center>
  )
}

export default SmartAccountOTPForm
