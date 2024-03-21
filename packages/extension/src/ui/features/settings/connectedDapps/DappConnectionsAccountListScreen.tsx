import {
  BarBackButton,
  CellStack,
  Empty,
  NavigationContainer,
  P3,
  icons,
} from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"

import { PreAuthorization } from "../../../../shared/preAuthorization/schema"
import { useAccount } from "../../accounts/accounts.state"
import { AccountListItem } from "../../accounts/AccountListItem"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../routes"
import { Flex } from "@chakra-ui/react"

const { LinkIcon, ChevronRightIcon } = icons

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
      title={"Connected dapps"}
    >
      {accountIdentifiers.length === 0 ? (
        <Empty icon={<LinkIcon />} title={"No connected dapps"} />
      ) : (
        <CellStack width={"full"}>
          <P3 color="text-secondary">
            One or more dapps are connected to these accounts:
          </P3>
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
  const account = useAccount(preAuthorizations[0].account)
  const onClick = () => {
    navigate(routes.settingsDappConnectionsAccount(account?.address))
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
      accountAddress={account.address}
      accountDescription={accountDescription}
      networkId={account.networkId}
      accountType={account.type}
      isShield={Boolean(account.guardian)}
      onClick={onClick}
    >
      <ChevronRightIcon opacity={0.6} />
    </AccountListItem>
  )
}
