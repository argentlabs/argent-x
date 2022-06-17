import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled, { css } from "styled-components"
import useSWR from "swr"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import {
  getAccountIdentifier,
  isDeprecated,
} from "../../../shared/wallet.service"
import { useAppState } from "../../app.state"
import { ArrowCircleDownIcon } from "../../components/Icons/MuiIcons"
import { TransactionStatusIndicator } from "../../components/StatusIndicator"
import { routes } from "../../routes"
import { makeClickable } from "../../services/a11y"
import { formatTruncatedAddress } from "../../services/addresses"
import { fetchFeeTokenBalance } from "../accountTokens/tokens.service"
import { useAccountStatus } from "../accountTokens/useAccountStatus"
import { NetworkStatusWrapper } from "../networks/NetworkSwitcher"
import { useNetwork } from "../networks/useNetworks"
import { Account } from "./Account"
import { AccountColumn } from "./AccountColumn"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { AccountRow } from "./AccountRow"
import { getAccountImageUrl } from "./accounts.service"
import { useAccounts } from "./accounts.state"
import { ProfilePicture } from "./ProfilePicture"
import { checkIfUpgradeAvailable } from "./upgrade.service"

export const AccountListItemWrapper = styled.div<{
  selected?: boolean
}>`
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 20px 16px;

  display: flex;
  gap: 12px;
  align-items: center;

  transition: all 200ms ease-in-out;

  ${({ selected = false }) =>
    selected &&
    css`
      border: 1px solid rgba(255, 255, 255, 0.3);
    `}

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    outline: 0;
  }
`

const AccountStatusText = styled.p`
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
`

const AccountName = styled.h1`
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  margin: 0 0 5px 0;
`

interface AccountListProps {
  account: Account
  selectedAccount?: BaseWalletAccount
  canShowUpgrade?: boolean
}

export const AccountListItem: FC<AccountListProps> = ({
  account,
  selectedAccount,
  canShowUpgrade,
}) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const {
    network: { accountClassHash },
  } = useNetwork(switcherNetworkId)
  const status = useAccountStatus(account, selectedAccount)
  if (status.code === "DEPLOYING") {
    console.log("DEPLOYING", account)
  }
  const { accountNames } = useAccountMetadata()
  const accountName = getAccountName(account, accountNames)

  const { data: feeTokenBalance } = useSWR(
    [getAccountIdentifier(account), switcherNetworkId, "feeTokenBalance"],
    () => fetchFeeTokenBalance(account, switcherNetworkId),
    { suspense: false },
  )

  const { data: needsUpgrade = false } = useSWR(
    [getAccountIdentifier(account), accountClassHash, "showUpgradeBanner"],
    () => checkIfUpgradeAvailable(account, accountClassHash),
    { suspense: false },
  )

  const showUpgradeBanner = Boolean(needsUpgrade && feeTokenBalance?.gt(0))

  return (
    <AccountListItemWrapper
      {...makeClickable(() => {
        useAccounts.setState({
          selectedAccount: account,
          showMigrationScreen: account ? isDeprecated(account) : false,
        })
        navigate(routes.accountTokens())
      })}
      selected={status.code === "CONNECTED"}
    >
      <ProfilePicture src={getAccountImageUrl(accountName, account)} />
      <AccountRow>
        <AccountColumn>
          <AccountName>{accountName}</AccountName>
          <p>{formatTruncatedAddress(account.address)}</p>
        </AccountColumn>
        {status.code === "DEPLOYING" ? (
          <NetworkStatusWrapper>
            <TransactionStatusIndicator color="orange" />
            <AccountStatusText>Deploying</AccountStatusText>
          </NetworkStatusWrapper>
        ) : (
          canShowUpgrade &&
          showUpgradeBanner && (
            <NetworkStatusWrapper>
              <ArrowCircleDownIcon
                style={{ maxHeight: "16px", maxWidth: "16px" }}
              />
              <AccountStatusText>Upgrade</AccountStatusText>
            </NetworkStatusWrapper>
          )
        )}
      </AccountRow>
    </AccountListItemWrapper>
  )
}
