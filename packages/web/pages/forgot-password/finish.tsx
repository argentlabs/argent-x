import { H4, P3, icons } from "@argent/ui"
import { Box } from "@chakra-ui/react"
import { useRouter } from "next/router"
import useSwr from "swr"

import { Layout } from "../../components/Layout"
import { SetPasswordForm } from "../../components/SetPasswordForm"
import { useBackendAccount } from "../../hooks/account"
import {
  changePassword,
  retrieveAccountWithDevice,
} from "../../services/account"
import Home from ".."

const { TickCircleIcon } = icons

export default function ForgotPasswordFinish() {
  const navigate = useRouter()
  const { account, error: beError } = useBackendAccount()
  const { data, error } = useSwr(
    "retrieveAccountWithDevice",
    retrieveAccountWithDevice,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  )

  console.log(data, error)

  if (data && account) {
    return (
      <Layout maxW={330}>
        <SetPasswordForm
          email={account.email}
          onSubmit={async ({ password }) => {
            await changePassword(password)
            await navigate.push("/dashboard")
          }}
        />
      </Layout>
    )
  }

  if (error || beError) {
    return (
      <Layout maxW={330} gap={6} textAlign="center">
        {/* TODO: replace by x icon */}
        <TickCircleIcon color="red" height="72px" width="72px" />
        <Box>
          <H4>Recovery failed</H4>
        </Box>
        <P3 mt={2}>
          Please try again later or contact support if the problem persists.
        </P3>
      </Layout>
    )
  }

  return <Home />
}
