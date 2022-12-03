import { Button, H4, P3 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"

import { Layout } from "../../components/Layout"
import { Navigate } from "../../components/Navigate"
import { requestEmail } from "../../services/register"

export default function ForgotPassword() {
  const navigate = useRouter()

  const { handleSubmit } = useForm()
  const email = navigate.query["email"]
  if (typeof email !== "string") {
    return <Navigate to="/" />
  }

  return (
    <Layout
      maxW={330}
      as="form"
      onSubmit={handleSubmit(async () => {
        try {
          await requestEmail(email) // TODO: request email to authenticate existing device for recovery
          return navigate.push(
            "/pin?flow=forgotPassword&email=" + encodeURIComponent(email),
            "/pin",
          )
        } catch {
          console.warn("Skipping email request, as backend is not ready yet")
          return navigate.push(
            "/forgot-password/wait?email=" + encodeURIComponent(email),
            "/forgot-password/wait",
          )
        }
      })}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={8}
      >
        <H4 textAlign="center">Reset password</H4>
        <P3 textAlign="center">
          You will regain access to your account. You need to confirm your email
          address in the process and wait for the <b>24h</b> security delay to
          expire.
        </P3>
      </Box>
      <Flex gap={4}>
        <Button variant={"outline"} onClick={() => navigate.push("/password")}>
          Cancel
        </Button>
        <Button colorScheme={"primary"} type="submit">
          Reset password
        </Button>
      </Flex>
    </Layout>
  )
}
