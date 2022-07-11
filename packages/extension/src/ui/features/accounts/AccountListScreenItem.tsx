import { FC, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import {
  getAccountIdentifier,
  isDeprecated,
} from "../../../shared/wallet.service"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { usePreAuthorizations } from "../actions/connectDapp/usePreAuthorizations"
import { useOriginatingHost } from "../browser/useOriginatingHost"
import { useCurrentNetwork } from "../networks/useNetworks"
import { Account } from "./Account"
import { AccountListItem } from "./AccountListItem"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useAccounts } from "./accounts.state"
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
  const { preAuthorizations } = usePreAuthorizations()

  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  const isConnected = useMemo(() => {
    if (!originatingHost || !account) {
      return false
    }
    return (
      preAuthorizations?.accountsByHost[originatingHost] &&
      preAuthorizations?.accountsByHost[originatingHost].includes(
        account.address,
      )
    )
  }, [account, originatingHost, preAuthorizations?.accountsByHost])

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
    <AccountListItem
      {...makeClickable(() => {
        useAccounts.setState({
          selectedAccount: account,
          showMigrationScreen: account ? isDeprecated(account) : false,
        })
        navigate(routes.accountTokens())
      })}
      accountName={accountName}
      accountAddress={account.address}
      networkId={account.networkId}
      outline={status.code === "CONNECTED"}
      deploying={status.code === "DEPLOYING"}
      upgrade={canShowUpgrade && showUpgradeBanner}
      connected={isConnected}
    />
  )
}
