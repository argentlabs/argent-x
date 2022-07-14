import { FC, useCallback, useMemo, useState } from "react"
import styled from "styled-components"

import { ColumnCenter } from "../../../components/Column"
import { LinkIcon } from "../../../components/Icons/MuiIcons"
import { makeClickable } from "../../../services/a11y"
import { P } from "../../../theme/Typography"
import { Account } from "../../accounts/Account"
import { IAccountListItem } from "../../accounts/AccountListItem"
import {
  getAccountName,
  useAccountMetadata,
} from "../../accounts/accountMetadata.state"
import { useAccounts } from "../../accounts/accounts.state"
import { AccountSelect } from "../../accounts/AccountSelect"
import { ConfirmPageProps, ConfirmScreen } from "../ConfirmScreen"
import { ConnectDappAccountListItem } from "./ConnectDappAccountListItem"
import { DappIcon } from "./DappIcon"
import { useDappDisplayAttributes } from "./useDappDisplayAttributes"
import { usePreAuthorizations } from "./usePreAuthorizations"

interface ConnectDappProps extends Omit<ConfirmPageProps, "onSubmit"> {
  onConnect: (selectedAccount: Account) => void
  onDisconnect: (selectedAccount: Account) => void
  host: string
}

const Code = styled.code`
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  padding: 0 0.5em;
`

export const useAccountAddressIsConnected = (host: string) => {
  const { preAuthorizations } = usePreAuthorizations()
  const getIsConnected = useCallback(
    (accountAddress: string) => {
      return (
        preAuthorizations?.accountsByHost[host] &&
        preAuthorizations?.accountsByHost[host].includes(accountAddress)
      )
    },
    [host, preAuthorizations],
  )
  return getIsConnected
}

export interface IConnectDappAccountSelect {
  accounts: Account[]
  selectedAccountAddress?: string
  onSelectedAccountAddressChange?: (accountAddress: string) => void
  host: string
}

export const ConnectDappAccountSelect: FC<IConnectDappAccountSelect> = ({
  accounts = [],
  selectedAccountAddress,
  onSelectedAccountAddressChange,
  host,
}) => {
  const getIsConnected = useAccountAddressIsConnected(host)
  const { accountNames } = useAccountMetadata()
  const makeAccountListItem = useCallback(
    (account: Account): IAccountListItem => {
      const accountName = getAccountName(account, accountNames)
      const connected = getIsConnected(account.address)
      return {
        accountName,
        accountAddress: account.address,
        networkId: account.networkId,
        connected,
      }
    },
    [accountNames, getIsConnected],
  )
  const accountItems = useMemo(
    () => accounts.map(makeAccountListItem),
    [accounts, makeAccountListItem],
  )
  const selectedAccountItem = useMemo(
    () =>
      accountItems.find(
        (accountItem) => accountItem.accountAddress === selectedAccountAddress,
      ),
    [accountItems, selectedAccountAddress],
  )
  const onSelectedAccountItemChange = useCallback(
    (accountItem: IAccountListItem) => {
      console.log("onSelectedAccountItemChange", accountItem)
      onSelectedAccountAddressChange &&
        onSelectedAccountAddressChange(accountItem.accountAddress)
    },
    [onSelectedAccountAddressChange],
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
`

const Host = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 8px;
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
  const { accounts, selectedAccount: initiallySelectedAccount } = useAccounts()
  const [connectAccountAddress, setConnectAccountAddress] = useState(
    initiallySelectedAccount?.address,
  )
  const getIsConnected = useAccountAddressIsConnected(host)

  const selectedAccountIsAlreadyConnected = useMemo(() => {
    return connectAccountAddress && getIsConnected(connectAccountAddress)
  }, [connectAccountAddress, getIsConnected])

  const selectedAccount = useMemo(() => {
    if (connectAccountAddress) {
      const account = accounts.find(
        ({ address }) => address === connectAccountAddress,
      )
      return account
    }
  }, [accounts, connectAccountAddress])

  const onSelectedAccountChange = useCallback(
    (accountAddress: string) => {
      console.log("onSelectedAccountChange", selectedAccount)
      setConnectAccountAddress(accountAddress)
    },
    [selectedAccount],
  )

  const onConnect = useCallback(() => {
    selectedAccount && onConnectProp(selectedAccount)
  }, [onConnectProp, selectedAccount])

  const onDisconnect = useCallback(() => {
    selectedAccount && onDisconnectProp(selectedAccount)
  }, [onDisconnectProp, selectedAccount])

  const dappDisplayAttributes = useDappDisplayAttributes(host)

  return (
    <ConfirmScreen
      confirmButtonText={
        selectedAccountIsAlreadyConnected ? "Continue" : "Connect"
      }
      rejectButtonText={
        selectedAccountIsAlreadyConnected ? "Disconnect" : "Reject"
      }
      onSubmit={onConnect}
      onReject={selectedAccountIsAlreadyConnected ? onDisconnect : onRejectProp}
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
          accounts={accounts}
          selectedAccountAddress={connectAccountAddress}
          onSelectedAccountAddressChange={onSelectedAccountChange}
          host={host}
        />
        {selectedAccountIsAlreadyConnected && (
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
    </ConfirmScreen>
  )
}
