import { FC } from "react"
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
import { withPolling } from "../../services/swr"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useSelectedAccountStore } from "./accounts.state"
import { checkIfUpgradeAvailable } from "./upgrade.service"

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
    { suspense: false, ...withPolling(10000) },
  )

  const { data: needsUpgrade = false } = useSWR(
    [getAccountIdentifier(account), accountClassHash, "showUpgradeBanner"],
    () => checkIfUpgradeAvailable(account, accountClassHash),
    { suspense: false, ...withPolling(10000) },
  )

  const showUpgradeBanner = Boolean(needsUpgrade && feeTokenBalance?.gt(0))

  return (
    <AccountListItem
      {...makeClickable(() => {
        useSelectedAccountStore.setState({
          selectedAccount: account,
          showMigrationScreen: account ? isDeprecated(account) : false,
        })
        navigate(routes.accountTokens())
      })}
      accountName={accountName}
      accountAddress={account.address}
      networkId={account.networkId}
      accountType={account.type}
      outline={status.code === "CONNECTED"}
      deploying={status.code === "DEPLOYING"}
      upgrade={canShowUpgrade && showUpgradeBanner}
      connected={isConnected}
    />
  )
}
