import {
  BarBackButton,
  Button,
  FieldError,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { Center, HStack, PinInputField } from "@chakra-ui/react"
import { FC, MouseEvent, useCallback, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"

import { isFetcherError } from "../../../shared/api/fetcher"
import {
  EmailVerificationStatus,
  getVerificationErrorMessage,
} from "../../../shared/shield/backend/account"
import { ARGENT_SHIELD_ERROR_EMAIL_IN_USE } from "../../../shared/shield/constants"
import { confirmEmail, requestEmail } from "../../../shared/shield/register"
import { updateVerifiedEmail } from "../../../shared/shield/verifiedEmail"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { ControlledPinInput } from "../../components/ControlledPinInput"
import { shieldValidateAccount } from "../../services/shieldAccount"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { ShieldHeader } from "./ui/ShieldHeader"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

const { EmailIcon, ResendIcon } = icons

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

  return (
    <NavigationContainer
      leftButton={onBack ? <BarBackButton onClick={onBack} /> : null}
      title={"Argent Shield"}
    >
      <ShieldHeader
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

                  /** successfully verifified with backend - persist this email in the local db */
                  await updateVerifiedEmail(email)

                  onOTPConfirmed()
                } catch (e) {
                  if (isFetcherError(e)) {
                    if (e.responseJson.status === "notRequested") {
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
                          e.responseJson.status as EmailVerificationStatus,
                        ),
                      })
                    }
                  }
                  if (
                    (e as Error)?.message?.toString() ===
                    `Error: ${ARGENT_SHIELD_ERROR_EMAIL_IN_USE}`
                  ) {
                    toast({
                      title:
                        "Email in use - You must use a different email for this wallet",
                      status: "error",
                      duration: 3000,
                    })
                    onOTPReEnterEmail()
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
