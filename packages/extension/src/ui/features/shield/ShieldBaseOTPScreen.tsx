import {
  BarBackButton,
  Button,
  FieldError,
  FlowHeader,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { Center, HStack, PinInputField } from "@chakra-ui/react"
import { FC, MouseEvent, useCallback, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { z } from "zod"

import {
  EmailVerificationStatus,
  emailVerificationStatusErrorSchema,
  getVerificationErrorMessage,
} from "../../../shared/shield/backend/account"
import {
  confirmEmail,
  requestEmail,
  shieldAddAccount,
  shieldValidateAccount,
} from "../../../shared/shield/register"
import {
  ShieldValidationErrorMessage,
  getShieldValidationErrorFromBackendError,
} from "../../../shared/shield/validation"
import { updateVerifiedEmail } from "../../../shared/shield/verifiedEmail"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { ControlledPinInput } from "../../components/ControlledPinInput"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { ShieldValidationErrorScreen } from "./ShieldValidationErrorScreen"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

const { EmailIcon, ResendIcon, ArgentShieldIcon } = icons

const schema = yup
  .object()
  .required()
  .shape({
    otp: yup
      .string()
      .matches(/^[0-9]{6}$/, "Must be 6 digits")
      .required("Passcode is required"),
  })

export interface ShieldBaseOTPScreenProps {
  onBack?: () => void
  email?: string
  onOTPReEnterEmail: () => void
  onOTPConfirmed: () => void
}

export const ShieldBaseOTPScreen: FC<ShieldBaseOTPScreenProps> = ({
  onBack,
  email,
  onOTPReEnterEmail,
  onOTPConfirmed,
}) => {
  const verifiedEmail = useShieldVerifiedEmail()
  const resolver = useYupValidationResolver(schema)
  const formRef = useRef<HTMLFormElement>(null)
  const toast = useToast()
  const [shieldValdationError, setShieldValdationError] =
    useState<ShieldValidationErrorMessage | null>(null)

  const onShieldValdationErrorDone = useCallback(() => {
    onOTPReEnterEmail()
  }, [onOTPReEnterEmail])

  const onResendEmail = useCallback(
    async (e: MouseEvent) => {
      e.preventDefault()
      if (!email) {
        return
      }
      try {
        await requestEmail(email)
        toast({
          icon: <EmailIcon />,
          title: "A new code has been sent to your email",
          status: "info",
          duration: 3000,
        })
      } catch (error) {
        IS_DEV && console.warn(coerceErrorToString(error))
        toast({
          title: "Unable to verify email",
          status: "error",
          duration: 3000,
        })
      }
    },
    [email, toast],
  )

  const obfuscatedEmail = useMemo(() => {
    if (!email) {
      return ""
    }
    const elements = email.split("@")
    const firstLetter = elements[0].substring(0, 1)
    elements[0] = `${firstLetter}*****`
    return elements.join("@")
  }, [email])

  const { handleSubmit, formState, setError, control } = useForm({
    defaultValues: {
      otp: "",
    },
    resolver,
  })

  if (shieldValdationError) {
    return (
      <ShieldValidationErrorScreen
        onBack={onBack}
        error={shieldValdationError}
        onDone={onShieldValdationErrorDone}
      />
    )
  }

  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : null}
      title={"Argent Shield"}
    >
      <FlowHeader
        icon={EmailIcon}
        title={"Check your email"}
        subtitle={`If you signed up for the beta we have sent a verification code to ${obfuscatedEmail}`}
      />
      {verifiedEmail === null ? (
        <></> /** initialising */
      ) : (
        <>
          <Center>
            <form
              ref={formRef}
              onSubmit={handleSubmit(async ({ otp }) => {
                try {
                  await confirmEmail(otp)

                  /** always check the account can be used and exists in backend */
                  await shieldValidateAccount()
                  await shieldAddAccount()

                  /** successfully verifified and added account with backend - persist this email in the local db */
                  await updateVerifiedEmail(email)

                  onOTPConfirmed()
                } catch (e) {
                  /** Email validation error */
                  const shieldError =
                    getShieldValidationErrorFromBackendError(e)
                  if (shieldError) {
                    return setShieldValdationError(shieldError)
                  }
                  /** Other possible error status from backend */
                  try {
                    const errorObject = z
                      .object({
                        message: z.string(),
                      })
                      .parse(e)
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
                            error.data.responseJson
                              .status as EmailVerificationStatus,
                          ),
                        })
                      }
                    }
                  } catch {
                    // couldn't parse the error
                  }
                  return setError("otp", {
                    type: "manual",
                    message: "Unknown error - please try again later",
                  })
                }
              })}
            >
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
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
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
              onClick={onResendEmail}
              size="2xs"
              colorScheme="transparent"
              color="neutrals.400"
              leftIcon={<ResendIcon />}
              isLoading={formState.isSubmitting}
              loadingText={"Verifying"}
            >
              Resend code
            </Button>
          </Center>
        </>
      )}
    </NavigationContainer>
  )
}
