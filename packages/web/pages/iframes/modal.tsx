import { useRouter } from "next/router"

import { useBackendAccount } from "../../hooks/account"

export default function Modal() {
  const navigate = useRouter()
  const { account } = useBackendAccount()

  const darkmode = navigate.query["darkmode"] === "true"

  if (account?.email) {
    return (
      <p
        style={{
          color: darkmode ? "white" : "black",
          backgroundColor: darkmode ? "black" : "white",
        }}
      >
        {account?.email}
      </p>
    )
  }

  return (
    <p
      style={{
        color: darkmode ? "white" : "black",
        backgroundColor: darkmode ? "black" : "white",
      }}
    >
      No email found
    </p>
  )
}
