// FIXME: remove when depricated accounts do not longer work
import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useSelectedAccountStore } from "../accounts/accounts.state"

const { AlertIcon } = icons

export const MigrationBanner: FC = () => {
  const navigate = useNavigate()
  return (
    <AlertButton
      colorScheme={"danger"}
      title="Please migrate your funds"
      description="This account will be deprecated soon"
      size="lg"
      icon={<AlertIcon />}
      onClick={() => {
        useSelectedAccountStore.setState({ showMigrationScreen: true })
        navigate(routes.accountTokens())
      }}
    />
  )
}
