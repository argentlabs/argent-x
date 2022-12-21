import { Button, icons } from "@argent/ui"
import { Circle, Flex } from "@chakra-ui/react"
import { FC, MouseEvent, ReactNode, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { isDeprecated } from "../../../shared/wallet.service"
import { routes } from "../../routes"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useSelectedAccountStore } from "./accounts.state"

const { MoreIcon, ChevronRightIcon } = icons

interface IAccountListScreenItem {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
  clickNavigateSettings?: boolean
  returnTo?: string
}

const IconContaier: FC<{ children: ReactNode }> = ({ children }) => (
  <Flex
    position={"absolute"}
    right={4}
    top={"50%"}
    transform={"translateY(-50%)"}
  >
    {children}
  </Flex>
)

export const AccountListScreenItem: FC<IAccountListScreenItem> = ({
  account,
  selectedAccount,
  needsUpgrade,
  clickNavigateSettings,
  returnTo,
}) => {
  const navigate = useNavigate()
  const status = useAccountStatus(account, selectedAccount)
  const originatingHost = useOriginatingHost()

  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  const isConnected = useIsPreauthorized(originatingHost || "", account)

  // this is unnecessary for now, as we can easily source the upgrade status from the the list item (props)
  // may be useful in the future if dont partition the list by upgrade status anymore
  //
  // const { data: needsUpgrade = false } = useSWR(
  //   [getAccountIdentifier(account), accountClassHash, "showUpgradeBanner"],
  //   () => checkIfUpgradeAvailable(account, accountClassHash),
  //   { suspense: false, ...withPolling(60 * 1000) },
  // )

  const onClick = useCallback(() => {
    useSelectedAccountStore.setState({
      selectedAccount: account,
      showMigrationScreen: account ? isDeprecated(account) : false,
    })
    navigate(returnTo || routes.accountTokens())
  }, [account, navigate, returnTo])

  const onAccountEdit = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.preventDefault()
      navigate(routes.editAccount(account.address))
    },
    [account.address, navigate],
  )

  return (
    <Flex position={"relative"} direction={"column"}>
      <AccountListItem
        aria-label={`Select ${accountName}`}
        onClick={clickNavigateSettings ? onAccountEdit : onClick}
        accountName={accountName}
        accountAddress={account.address}
        networkId={account.networkId}
        accountType={account.type}
        avatarOutlined={status.code === "CONNECTED"}
        deploying={status.code === "DEPLOYING"}
        upgrade={needsUpgrade}
        connectedHost={isConnected ? originatingHost : undefined}
        pr={14}
      >
        {clickNavigateSettings && (
          <IconContaier>
            <ChevronRightIcon opacity={0.6} />
          </IconContaier>
        )}
        {!clickNavigateSettings && (
          <IconContaier>
            <Button
              as={Circle}
              aria-label={`${accountName} options`}
              colorScheme="transparent"
              width={8}
              height={8}
              size="auto"
              rounded="full"
              onClick={onAccountEdit}
              bg="black"
              _hover={{
                bg: "neutrals.600",
              }}
            >
              <MoreIcon />
            </Button>
          </IconContaier>
        )}
      </AccountListItem>
    </Flex>
  )
}
