import { useRouter } from "next/router"

import { Layout } from "../components/Layout"
import { Navigate } from "../components/Navigate"
import { SetPasswordForm } from "../components/SetPasswordForm"
import { useAccount } from "../hooks/account"
import { useLocalHandle } from "../hooks/usePageGuard"
import { createAccount } from "../services/account"

export default function NewPassword() {
  const navigate = useRouter()
  const handler = useLocalHandle()
  const { mutate } = useAccount()

  const email = navigate.query["email"]
  if (typeof email !== "string") {
    return <Navigate to="/" />
  }

  return (
    <Layout maxW={330}>
      <SetPasswordForm
        email={email}
        onSubmit={async ({ password }) => {
          try {
            await createAccount(password)
            await mutate()
            if (handler) {
              handler.emit("ARGENT_WEB_WALLET::CONNECT", undefined)
            }
            return navigate.push("/dashboard")
          } catch (error) {
            console.error(error)
          }
        }}
      />
    </Layout>
  )
}
