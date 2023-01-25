import {
  BarBackButton,
  CellStack,
  FieldError,
  L2,
  NavigationContainer,
  useToast,
} from "@argent/ui"
import { Center, HStack, PinInputField, chakra } from "@chakra-ui/react"
import { FC, MouseEvent, useCallback, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"

import { isFetcherError } from "../../../shared/api/fetcher"
import {
  EmailVerificationStatus,
  getVerificationErrorMessage,
} from "../../../shared/shield/backend/account"
import { confirmEmail, requestEmail } from "../../../shared/shield/register"
import { updateVerifiedEmail } from "../../../shared/shield/verifiedEmail"
import { IS_DEV } from "../../../shared/utils/dev"
import { coerceErrorToString } from "../../../shared/utils/error"
import { ControlledPinInput } from "../../components/ControlledPinInput"
import { shieldMaybeAddAccount } from "../../services/shieldAccount"
import { useYupValidationResolver } from "../settings/useYupValidationResolver"
import { ShieldHeader } from "./ShieldHeader"
import { useShieldVerifiedEmail } from "./useShieldVerifiedEmail"

/** TODO: replace with common wallet component when merged */
const PinInputWrapper = chakra(HStack, {
  baseStyle: {
    gap: 2,
    display: "flex",
  },
})

const StyledPinInputField = chakra(PinInputField, {
  baseStyle: {
    _placeholder: {
      color: "transparent",
    },
  },
})

const schema = yup
  .object()
  .required()
  .shape({
    otp: yup
      .string()
      .matches(/^[0-9]{6}$/, "Must be 6 digits")
      .required(),
  })

export interface ShieldBaseOTPScreenProps {
  onBack?: () => void
  email?: string
  onOTPNotRequested: () => void
  onOTPConfirmed: () => void
}

export const ShieldBaseOTPScreen: FC<ShieldBaseOTPScreenProps> = ({
  onBack,
  email,
  onOTPNotRequested,
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
          title: "Verification email sent",
          status: "success",
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
      <CellStack>
        <ShieldHeader
          title={"2 - Enter code"}
          subtitle={`Enter the code we sent to your email: ${obfuscatedEmail}`}
        />
        {verifiedEmail === null ? (
          <></> /** initialising */
        ) : (
          <>
            <Center>
              <PinInputWrapper
                as={"form"}
                ref={formRef}
                onSubmit={handleSubmit(async ({ otp }) => {
                  try {
                    await confirmEmail(otp)

                    /** successfully verifified with backend - persist this email in the local db */
                    await updateVerifiedEmail(email)

                    /** always check the account exists in backend */
                    await shieldMaybeAddAccount()

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
                        onOTPNotRequested()
                      } else {
                        return setError("otp", {
                          type: "manual",
                          message: getVerificationErrorMessage(
                            e.responseJson.status as EmailVerificationStatus,
                          ),
                        })
                      }
                    }
                    return setError("otp", {
                      type: "manual",
                      message: "Unknown",
                    })
                  }
                })}
              >
                <ControlledPinInput
                  control={control}
                  name="otp"
                  autoFocus
                  type="number"
                  otp
                  isDisabled={formState.isSubmitting}
                  onComplete={() => {
                    formRef.current?.requestSubmit()
                  }}
                >
                  <StyledPinInputField />
                  <StyledPinInputField />
                  <StyledPinInputField />
                  <StyledPinInputField />
                  <StyledPinInputField />
                  <StyledPinInputField />
                </ControlledPinInput>
              </PinInputWrapper>
            </Center>
            <FieldError>{formState.errors.otp?.message}</FieldError>
            <L2 as="a" href="#" color={"accent.500"} onClick={onResendEmail}>
              Not received an email?
            </L2>
          </>
        )}
      </CellStack>
    </NavigationContainer>
  )
}
