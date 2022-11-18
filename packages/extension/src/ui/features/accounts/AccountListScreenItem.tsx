import { Button, icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback } from "react"
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

const { MoreIcon } = icons

interface IAccountListScreenItem {
  account: Account
  selectedAccount?: BaseWalletAccount
  needsUpgrade?: boolean
}

export const AccountListScreenItem: FC<IAccountListScreenItem> = ({
  account,
  selectedAccount,
  needsUpgrade,
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
    navigate(routes.accountTokens())
  }, [account, navigate])

  const onAccountEdit = useCallback(() => {
    navigate(routes.editAccount(account.address))
  }, [account.address, navigate])

  return (
    <Flex position={"relative"} direction={"column"}>
      <AccountListItem
        aria-label={`Select ${accountName}`}
        onClick={onClick}
        accountName={accountName}
        accountAddress={account.address}
        networkId={account.networkId}
        accountType={account.type}
        avatarOutlined={status.code === "CONNECTED"}
        deploying={status.code === "DEPLOYING"}
        upgrade={needsUpgrade}
        connected={isConnected}
        pr={14}
      />
      <Flex
        position={"absolute"}
        right={4}
        top={"50%"}
        transform={"translateY(-50%)"}
      >
        <Button
          aria-label={`${accountName} options`}
          backgroundColor="black"
          colorScheme="transparent"
          padding="1.5"
          fontSize="xl"
          size="auto"
          rounded="full"
          onClick={onAccountEdit}
        >
          <MoreIcon />
        </Button>
      </Flex>
    </Flex>
  )
}
