import { Button, FieldError, H5, Input } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"

import { Layout } from "../components/Layout"
import { enterEmailFormSchema } from "../schemas/forms/email"
import { isSubmitDisabled } from "../schemas/utils"
import { requestEmail } from "../services/register"

export default function Email() {
  const navigate = useRouter()
  const { handleSubmit, register, formState, setError } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(enterEmailFormSchema),
  })

  return (
    <Layout
      as="form"
      onSubmit={handleSubmit(async ({ email }) => {
        try {
          console.log("Registering email", email)
          await requestEmail(email)
          return navigate.push(`/pin?email=${email}`, "/pin")
        } catch {
          return setError("email", {
            type: "manual",
            message:
              "We were not able to send you an email, please try again in 30 seconds.",
          })
        }
      })}
      maxW={330}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={8}
      >
        <Image src="/dapp-logo.svg" alt="Argent Logo" width={72} height={72} />
        <H5 textAlign="center">
          Enter your email to connect to Some Cool Dapp
        </H5>
      </Box>
      <Input
        isInvalid={Boolean(formState.errors.email)}
        placeholder="Enter email"
        mb={2}
        {...register("email")}
      />
      <FieldError minH="1em" alignSelf="start">
        {formState.errors.email?.message}
      </FieldError>
      <Button
        colorScheme={"primary"}
        mt={4}
        type="submit"
        disabled={isSubmitDisabled(formState)}
      >
        Continue
      </Button>
    </Layout>
  )
}
