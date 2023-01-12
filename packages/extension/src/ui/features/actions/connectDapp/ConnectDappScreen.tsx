import { FC, useCallback, useMemo, useState } from "react"
import styled from "styled-components"

import {
  equalPreAuthorization,
  useIsPreauthorized,
  usePreAuthorizations,
} from "../../../../shared/preAuthorizations"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/wallet.service"
import { ColumnCenter } from "../../../components/Column"
import { LinkIcon } from "../../../components/Icons/MuiIcons"
import { Account } from "../../accounts/Account"
import { AccountListItemProps } from "../../accounts/AccountListItem"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { useAccounts, useSelectedAccount } from "../../accounts/accounts.state"
import { AccountSelect } from "../../accounts/AccountSelect"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "../DeprecatedConfirmScreen"
import { DappIcon } from "./DappIcon"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"

interface ConnectDappProps extends Omit<ConfirmPageProps, "onSubmit"> {
  onConnect: (selectedAccount: Account) => void
  onDisconnect: (selectedAccount: Account) => void
  host: string
}

export interface IConnectDappAccountSelect {
  accounts: Account[]
  selectedAccount?: BaseWalletAccount
  onSelectedAccountChange?: (account: BaseWalletAccount) => void
  host: string
}

export const ConnectDappAccountSelect: FC<IConnectDappAccountSelect> = ({
  accounts = [],
  selectedAccount,
  onSelectedAccountChange,
  host,
}) => {
  const { accountNames } = useAccountMetadata()
  const preAuths = usePreAuthorizations()
  const makeAccountListItem = useCallback(
    (account: Account): AccountListItemProps => {
      const accountName = getAccountName(account, accountNames)
      const connected = Boolean(
        preAuths.some((preAuth) =>
          equalPreAuthorization(preAuth, {
            host,
            account,
          }),
        ),
      )
      return {
        accountName,
        accountAddress: account.address,
        networkId: account.networkId,
        connectedHost: connected ? host : undefined,
        accountType: account.type,
      }
    },
    [accountNames, host, preAuths],
  )
  const accountItems = useMemo(
    () => accounts.map(makeAccountListItem),
    [accounts, makeAccountListItem],
  )
  const selectedAccountItem = useMemo(
    () =>
      accountItems.find(
        (accountItem) =>
          selectedAccount &&
          accountsEqual(
            {
              address: accountItem.accountAddress,
              networkId: accountItem.networkId,
            },
            selectedAccount,
          ),
      ),
    [accountItems, selectedAccount],
  )
  const onSelectedAccountItemChange = useCallback(
    (accountItem: AccountListItemProps) => {
      onSelectedAccountChange &&
        onSelectedAccountChange({
          address: accountItem.accountAddress,
          networkId: accountItem.networkId,
        })
    },
    [onSelectedAccountChange],
  )
  return (
    <AccountSelect
      accounts={accountItems}
      selectedAccount={selectedAccountItem}
      onSelectedAccountChange={onSelectedAccountItemChange}
    />
  )
}

const DappIconContainer = styled.div`
  width: 64px;
  height: 64px;
`

const Title = styled.div`
  font-weight: 600;
  font-size: 17px;
  margin-top: 16px;
  text-align: center;
`

const Host = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 8px;
  text-align: center;
`

const HR = styled.div`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  margin: 16px 0;
`

const SmallText = styled.div`
  font-size: 13px;
`

const SelectContainer = styled.div`
  padding-top: 16px;
`

const ConnectedStatusWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  display: flex;
  align-items: center;
  font-size: 10px;
  padding-top: 8px;
`

const ConnectedIcon = styled(LinkIcon)`
  transform: rotate(-45deg);
  font-size: 16px;
`

const List = styled.ul`
  font-size: 15px;
  line-height: 20px;
  margin-top: 8px;
  list-style-position: inside;
`

const Bullet = styled.li``

const SmallGreyText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  margin-left: 20px;
`

export const ConnectDappScreen: FC<ConnectDappProps> = ({
  onConnect: onConnectProp,
  onDisconnect: onDisconnectProp,
  onReject: onRejectProp,
  host,
  ...rest
}) => {
  const initiallySelectedAccount = useSelectedAccount()
  const visibleAccounts = useAccounts()
  const [connectedAccount, setConnectedAccount] = useState<
    BaseWalletAccount | undefined
  >(initiallySelectedAccount)
  const isConnected = useIsPreauthorized(host, initiallySelectedAccount)

  const selectedAccount = useMemo(() => {
    if (connectedAccount) {
      const account = visibleAccounts.find((account) =>
        accountsEqual(account, connectedAccount),
      )
      return account
    }
  }, [visibleAccounts, connectedAccount])

  const onSelectedAccountChange = useCallback((account: BaseWalletAccount) => {
    setConnectedAccount(account)
  }, [])

  const onConnect = useCallback(() => {
    selectedAccount && onConnectProp(selectedAccount)
  }, [onConnectProp, selectedAccount])

  const onDisconnect = useCallback(() => {
    selectedAccount && onDisconnectProp(selectedAccount)
  }, [onDisconnectProp, selectedAccount])

  const dappDisplayAttributes = useDappDisplayAttributes(host)

  return (
    <DeprecatedConfirmScreen
      confirmButtonText={isConnected ? "Continue" : "Connect"}
      rejectButtonText={isConnected ? "Disconnect" : "Reject"}
      onSubmit={onConnect}
      onReject={isConnected ? onDisconnect : onRejectProp}
      {...rest}
    >
      <ColumnCenter gap={"4px"}>
        <DappIconContainer>
          <DappIcon host={host} />
        </DappIconContainer>
        <Title>Connect to {dappDisplayAttributes?.title}</Title>
        <Host>{host}</Host>
      </ColumnCenter>
      <HR />
      <SmallText>Select the account to connect:</SmallText>
      <SelectContainer>
        <ConnectDappAccountSelect
          accounts={visibleAccounts}
          selectedAccount={connectedAccount}
          onSelectedAccountChange={onSelectedAccountChange}
          host={host}
        />
        {isConnected && (
          <ConnectedStatusWrapper>
            <ConnectedIcon />
            <span> This account is already connected</span>
          </ConnectedStatusWrapper>
        )}
      </SelectContainer>
      <HR />
      <SmallText>This dapp will be able to:</SmallText>
      <List>
        <Bullet>Read your wallet address</Bullet>
        <Bullet>Request transactions</Bullet>{" "}
        <SmallGreyText>
          You will still need to sign any new transaction
        </SmallGreyText>
      </List>
    </DeprecatedConfirmScreen>
  )
}
