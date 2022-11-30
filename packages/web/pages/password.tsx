import { Button, FieldError, H4, H6, Input, L2 } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"

import { Layout } from "../components/Layout"
import { Navigate } from "../components/Navigate"
import { useAccount } from "../hooks/account"
import { useLocalHandle } from "../hooks/usePageGuard"
import { createPasswordFormSchema } from "../schemas/forms/password"
import { isSubmitDisabled } from "../schemas/utils"
import { retrieveAccountWithPassword } from "../services/account"

export default function Password() {
  const navigate = useRouter()
  const handler = useLocalHandle()
  const { mutate } = useAccount()

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
          await retrieveAccountWithPassword(password)
          await mutate()
          if (handler) {
            handler.emit("ARGENT_WEB_WALLET::CONNECT", undefined)
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
        <H4 textAlign="center">Enter your password</H4>
        <H6 textAlign="center">To log in to {email}</H6>
      </Box>
      <Input
        // TODO: [UI] Add good password strength indicator
        placeholder="Password"
        mb={2}
        autoFocus
        {...register("password")}
        isInvalid={!!formState.errors.password}
      />
      <FieldError minH="1em" alignSelf="start">
        {formState.errors.password?.message}
      </FieldError>
      <L2 as="a" href="#" mt={4} color={"accent.500"}>
        Forgotten your password?
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
