import {
  FieldError,
  H5,
  L2,
  PinInput,
  PinInputField,
  PinInputWrapper,
  icons,
} from "@argent/ui"
import { Box, Spinner } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { useRef } from "react"
import { useForm } from "react-hook-form"

import { ControlledPinInput } from "../components/controlled/PinInput"
import { Layout } from "../components/Layout"
import { Navigate } from "../components/Navigate"
import { confirmEmailPinForm } from "../schemas/forms/pin"
import { isSubmitDisabled } from "../schemas/utils"
import {
  EmailVerificationStatus,
  getVerificationErrorMessage,
} from "../services/account"
import { confirmEmail } from "../services/register"

const { EmailIcon } = icons

export default function Pin() {
  const navigate = useRouter()

  const formRef = useRef<HTMLFormElement>(null)
  const { handleSubmit, formState, setError, control } = useForm({
    defaultValues: {
      pin: "",
    },
    resolver: zodResolver(confirmEmailPinForm),
  })

  const email = navigate.query["email"]
  if (!email) {
    return <Navigate to="/email" />
  }

  return (
    <Layout maxW={330}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={8}
      >
        <Box
          width={"72px"}
          height={"72px"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={16}
          bgColor={"gray.100"}
        >
          <EmailIcon width={32} height={32} />
        </Box>
        <H5 textAlign="center">Enter the code we sent to {email}</H5>
      </Box>
      <PinInputWrapper
        as="form"
        ref={formRef}
        mb={6}
        onSubmit={handleSubmit(async ({ pin }) => {
          try {
            await confirmEmail(pin)

            return navigate.push(`/password?email=${email}`, "/pin")
          } catch (e) {
            if (e instanceof Error) {
              return setError("pin", {
                type: "manual",
                message: getVerificationErrorMessage(
                  e.cause as EmailVerificationStatus,
                ),
              })
            }
          }
        })}
      >
        <ControlledPinInput
          control={control}
          name="pin"
          autoFocus
          type="number"
          otp
          isDisabled={isSubmitDisabled(formState)}
          onComplete={async () => {
            console.log("onComplete")
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
      </PinInputWrapper>
      {formState.isSubmitting ? (
        <L2 textAlign="center">
          <Spinner size="xs" mr={2} thickness="1px" />
          Verifying...
        </L2>
      ) : formState.errors.pin ? (
        <FieldError textAlign={"center"}>
          {formState.errors.pin.message}
        </FieldError>
      ) : (
        <L2 as="a" href="#" color={"accent.500"}>
          Not received an email?
        </L2>
      )}
    </Layout>
  )
}
