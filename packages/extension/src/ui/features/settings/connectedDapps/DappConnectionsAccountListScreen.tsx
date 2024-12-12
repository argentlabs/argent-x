import {
  BarBackButton,
  CellStack,
  Empty,
  icons,
  NavigationContainer,
  P2,
} from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { useWalletAccount } from "../../accounts/accounts.state"
import { AccountListItem } from "../../accounts/AccountListItem"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../shared/ui/routes"
import { Flex } from "@chakra-ui/react"

const { LinkPrimaryIcon, ChevronRightSecondaryIcon } = icons

interface DappConnectionsAccountListScreenProps {
  onBack: ReactEventHandler
  preAuthorizationsByAccountIdentifier: Record<string, PreAuthorization[]>
}

export const DappConnectionsAccountListScreen: FC<
  DappConnectionsAccountListScreenProps
> = ({ preAuthorizationsByAccountIdentifier, onBack }) => {
  const accountIdentifiers = Object.keys(preAuthorizationsByAccountIdentifier)
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Authorised dapps"}
    >
      {accountIdentifiers.length === 0 ? (
        <Empty icon={<LinkPrimaryIcon />} title={"No authorised dapps"} />
      ) : (
        <CellStack width={"full"}>
          <P2 color="text-secondary">
            One or more dapps are connected to these accounts:
          </P2>
          <Flex
            w="full"
            borderTop="1px solid"
            borderColor={"neutrals.700"}
            mt={2}
            pb={3}
          />
          {Object.entries(preAuthorizationsByAccountIdentifier).map(
            ([accountIdentifier, preAuthorizations]) => {
              return (
                <DappConnectionsAccountListItem
                  key={accountIdentifier}
                  preAuthorizations={preAuthorizations}
                />
              )
            },
          )}
        </CellStack>
      )}
    </NavigationContainer>
  )
}

function DappConnectionsAccountListItem({
  preAuthorizations,
}: {
  preAuthorizations: PreAuthorization[]
}) {
  const navigate = useNavigate()
  const account = useWalletAccount(preAuthorizations[0].account.id)
  const onClick = () => {
    navigate(routes.settingsDappConnectionsAccount(account?.id))
  }
  if (!account) {
    return null
  }
  const accountDescription =
    preAuthorizations.length === 1
      ? "1 dapp connected"
      : `${preAuthorizations.length} dapps connected`
  return (
    <AccountListItem
      avatarSize={9}
      accountName={account.name}
      accountId={account.id}
      accountAddress={account.address}
      accountDescription={accountDescription}
      networkId={account.networkId}
      accountType={account.type}
      isSmartAccount={Boolean(account.guardian)}
      isLedger={account.signer.type === "ledger"}
      onClick={onClick}
    >
      <ChevronRightSecondaryIcon opacity={0.6} />
    </AccountListItem>
  )
}
