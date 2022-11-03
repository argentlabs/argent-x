import { Button, icons } from "@argent/ui"
import {
  Box,
  ButtonProps,
  Circle,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  forwardRef,
} from "@chakra-ui/react"
import {
  ComponentProps,
  ComponentPropsWithRef,
  FC,
  MouseEvent,
  MouseEventHandler,
  useCallback,
} from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { useIsPreauthorized } from "../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import {
  getAccountIdentifier,
  isDeprecated,
} from "../../../shared/wallet.service"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useSelectedAccountStore } from "./accounts.state"
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
  const { accountClassHash, id: networkId } = useCurrentNetwork()
  const status = useAccountStatus(account, selectedAccount)
  const originatingHost = useOriginatingHost()

  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  const isConnected = useIsPreauthorized(originatingHost || "", account)

  const { data: feeTokenBalance } = useSWR(
    [getAccountIdentifier(account), networkId, "feeTokenBalance"],
    () => fetchFeeTokenBalance(account, networkId),
    { suspense: false },
  )

  const { data: needsUpgrade = false } = useSWR(
    [getAccountIdentifier(account), accountClassHash, "showUpgradeBanner"],
    () => checkIfUpgradeAvailable(account, accountClassHash),
    { suspense: false },
  )

  const showUpgradeBanner = Boolean(needsUpgrade && feeTokenBalance?.gt(0))

  return (
    <Flex position={"relative"} direction={"column"}>
      <AccountListItem
        aria-label={`Select ${accountName}`}
        onClick={() => {
          useSelectedAccountStore.setState({
            selectedAccount: account,
            showMigrationScreen: account ? isDeprecated(account) : false,
          })
          navigate(routes.accountTokens())
        }}
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
        zIndex={1} /** menu appears over top of siblings */
      >
        <Menu isLazy>
          <MenuButton
            aria-label={`${accountName} options`}
            backgroundColor="black"
            colorScheme="transparent"
            padding="1.5"
            fontSize="xl"
            size="auto"
            rounded="full"
            as={Button}
          >
            <MoreIcon />
          </MenuButton>
          <MenuList>
            <MenuItem>Item</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  )
}
