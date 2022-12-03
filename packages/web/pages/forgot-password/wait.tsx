import { H4, L1, P3, icons } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { useRouter } from "next/router"

import { Layout } from "../../components/Layout"
import { Navigate } from "../../components/Navigate"

const { TickCircleIcon } = icons

export default function ForgotPasswordWait() {
  const navigate = useRouter()

  const email = navigate.query["email"]
  if (!email) {
    return <Navigate to="/" />
  }

  return (
    <Layout maxW={330} gap={6} textAlign="center">
      <TickCircleIcon color="#08A681" height="72px" width="72px" />
      <Box>
        <L1>You initiated a password reset for</L1>
        <H4>{email}</H4>
      </Box>
      <P3 mt={2}>
        You will receive an email in <b>24 hours</b> with a link to set a new
        password.
      </P3>
    </Layout>
  )
}
