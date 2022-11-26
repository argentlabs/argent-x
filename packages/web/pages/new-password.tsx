import { Button, FieldError, H4, H6, Input, L2 } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"

import { Layout } from "../components/Layout"
import { Navigate } from "../components/Navigate"
import { createPasswordFormSchema } from "../schemas/forms/password"
import { isSubmitDisabled } from "../schemas/utils"
import { createAccount } from "../services/account"

export default function NewPassword() {
  const navigate = useRouter()

  const { formState, handleSubmit, setError, register } = useForm({
    defaultValues: {
      password: "",
    },
    resolver: zodResolver(createPasswordFormSchema),
  })

  const email = navigate.query["email"]
  if (typeof email !== "string") {
    return <Navigate to="/" />
  }

  return (
    <Layout
      as="form"
      onSubmit={handleSubmit(async ({ password }) => {
        try {
          const account = await createAccount(password)
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "ARGENT_WEB_WALLET::CONNECT",
                payload: {
                  address: account.address,
                },
              },
              "*",
            )
            return window.close()
          }
          return navigate.push("/dashboard")
        } catch (error) {
          console.error(error)
          if (error instanceof Error) {
            setError("password", { message: error.message })
          }
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
        <H4 textAlign="center">Set a password for your Argent WebWallet</H4>
        <H6 textAlign="center">{email}</H6>
      </Box>
      <Input
        // TODO: [UI] Add good password strength indicator
        placeholder="New password"
        mb={2}
        autoFocus
        {...register("password")}
        isInvalid={!!formState.errors.password}
      />
      <FieldError minH="1em" alignSelf="start">
        {formState.errors.password?.message}
      </FieldError>
      <L2 as="a" href="#" mt={4} color={"accent.500"}>
        How does this work?
      </L2>
      <Button
        colorScheme={"primary"}
        mt={8}
        type="submit"
        isLoading={formState.isSubmitting}
        disabled={isSubmitDisabled(formState)}
      >
        Continue
      </Button>
    </Layout>
  )
}
