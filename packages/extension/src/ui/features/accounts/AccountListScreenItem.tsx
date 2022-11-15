import { Button, icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { routes } from "../../routes"
import { withPolling } from "../../services/swr"
import { useFeeTokenBalance } from "../accountTokens/tokens.service"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { selectAccount } from "./accounts.service"
import { checkIfUpgradeAvailable } from "./upgrade.service"

const { MoreIcon } = icons

interface IAccountListScreenItem {
  account: Account
  selectedAccount?: BaseWalletAccount
  canShowUpgrade?: boolean
}

export const AccountListScreenItem: FC<IAccountListScreenItem> = ({
  account,
  selectedAccount,
  canShowUpgrade,
}) => {
  const navigate = useNavigate()
  const { accountClassHash } = useCurrentNetwork()
  const status = useAccountStatus(account, selectedAccount)
  const originatingHost = useOriginatingHost()

  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  const isConnected = useIsPreauthorized(originatingHost || "", account)

  const { feeTokenBalance } = useFeeTokenBalance(account)

  const { data: needsUpgrade = false } = useSWR(
    [getAccountIdentifier(account), accountClassHash, "showUpgradeBanner"],
    () => checkIfUpgradeAvailable(account, accountClassHash),
    { suspense: false, ...withPolling(60 * 1000) },
  )

  const onClick = useCallback(async () => {
    await selectAccount(account)
    navigate(routes.accountTokens())
  }, [account, navigate])

  const showUpgradeBanner = Boolean(needsUpgrade && feeTokenBalance?.gt(0))

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
        upgrade={canShowUpgrade && showUpgradeBanner}
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
