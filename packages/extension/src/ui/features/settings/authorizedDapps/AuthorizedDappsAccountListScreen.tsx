import { pluralise, type BackendSession } from "@argent/x-shared"
import { LinkPrimaryIcon, ChevronRightSecondaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  CellStack,
  Empty,
  NavigationContainer,
} from "@argent/x-ui"
import { useMemo, type FC, type ReactEventHandler } from "react"
import { useNavigate } from "react-router-dom"

import type { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { routes } from "../../../../shared/ui/routes"
import { AccountListItem } from "../../accounts/AccountListItem"
import { useWalletAccount } from "../../accounts/accounts.state"
import { useIsSignedIn } from "../../argentAccount/hooks/useIsSignedIn"

import { typographyStyles } from "@argent/x-ui/theme"

interface AuthorizedDappsAccountListScreenProps {
  onBack: ReactEventHandler
  preAuthorizationsByAccountIdentifier?: Record<string, PreAuthorization[]>
  activeSessionsByAccountIdentifier?: Record<string, BackendSession[]>
}

export const AuthorizedDappsAccountListScreen: FC<
  AuthorizedDappsAccountListScreenProps
> = ({
  preAuthorizationsByAccountIdentifier = {},
  activeSessionsByAccountIdentifier = {},
  onBack,
}) => {
  const isSignedIn = useIsSignedIn({
    initiator: "AuthorizedDappsAccountListScreen",
  })
  const accountIdentifiers = Object.keys(preAuthorizationsByAccountIdentifier)
  const activeAccountIdentifiers = Object.keys(
    activeSessionsByAccountIdentifier,
  )
  const uniqueAccountIdentifiers = Array.from(
    new Set([...accountIdentifiers, ...activeAccountIdentifiers]),
  )
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Authorized dapps"}
    >
      {uniqueAccountIdentifiers.length === 0 ? (
        <Empty icon={<LinkPrimaryIcon />} title={"No authorized dapps"} />
      ) : (
        <CellStack width={"full"}>
          {uniqueAccountIdentifiers.map((accountIdentifier) => {
            return (
              <AuthorizedDappsAccountListItem
                key={accountIdentifier}
                accountId={accountIdentifier}
                isSignedIn={isSignedIn}
                preAuthorizations={
                  preAuthorizationsByAccountIdentifier[accountIdentifier]
                }
                activeSessions={
                  activeSessionsByAccountIdentifier[accountIdentifier]
                }
              />
            )
          })}
        </CellStack>
      )}
    </NavigationContainer>
  )
}

function AuthorizedDappsAccountListItem({
  accountId,
  isSignedIn,
  preAuthorizations,
  activeSessions,
}: {
  accountId: string
  isSignedIn: boolean
  preAuthorizations?: PreAuthorization[]
  activeSessions?: BackendSession[]
}) {
  const navigate = useNavigate()
  const account = useWalletAccount(accountId)
  const isSmartAccount = account?.type === "smart"

  const onClick = () => {
    navigate(routes.settingsAuthorizedDappsAccount(accountId))
  }

  const accountDescription = useMemo(() => {
    const elements = []
    elements.push(
      `${pluralise(preAuthorizations?.length ?? 0, "dapp")} connected`,
    )
    if (isSmartAccount && isSignedIn) {
      elements.push(
        `${pluralise(activeSessions?.length ?? 0, "active session")}`,
      )
    }
    return elements.join(", ")
  }, [
    preAuthorizations?.length,
    isSmartAccount,
    isSignedIn,
    activeSessions?.length,
  ])

  if (!account) {
    return null
  }

  return (
    <AccountListItem
      avatarSize={9}
      emojiStyle={typographyStyles.H3}
      initialsStyle={typographyStyles.H4}
      accountName={account.name}
      accountId={account.id}
      accountAddress={account.address}
      accountDescription={accountDescription}
      networkId={account.networkId}
      accountType={account.type}
      isSmartAccount={Boolean(account.guardian)}
      isLedger={account.signer.type === "ledger"}
      onClick={onClick}
      avatarMeta={account.avatarMeta}
    >
      <ChevronRightSecondaryIcon opacity={0.6} />
    </AccountListItem>
  )
}
