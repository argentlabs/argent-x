import { FC } from "react"
import styled from "styled-components"

import Add from "../../assets/add.svg"
import Settings from "../../assets/settings.svg"
import { AccountList, AccountListItem } from "../components/Account/AccountList"
import { Header } from "../components/Header"
import { IconButton } from "../components/IconButton"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { H1, P } from "../components/Typography"
import { makeClickable } from "../utils/a11y"
import { getStatus } from "../utils/wallet"
import { Wallet } from "../Wallet"

const AccountListWrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${H1} {
    text-align: center;
  }

  > ${AccountList} {
    width: 100%;
  }
`

const IconButtonCenter = styled(IconButton)`
  margin: auto;
`

const Paragraph = styled(P)`
  text-align: center;
`

interface AccountListScreenProps {
  onAccountSelect: (account: string) => void
  onAddAccount: () => void
  onSettings: () => void
  wallets: Wallet[]
  activeWallet: string
  networkId: string
  onChangeNetwork: (networkId: string) => Promise<void> | void
  port: number
}

export const AccountListScreen: FC<AccountListScreenProps> = ({
  onAccountSelect,
  onAddAccount,
  onSettings,
  wallets,
  activeWallet,
  networkId,
  onChangeNetwork,
  port,
}) => (
  <AccountListWrapper>
    <Header>
      <IconButton size={36} {...makeClickable(onSettings, 99)}>
        <Settings />
      </IconButton>
      <NetworkSwitcher
        networkId={networkId}
        onChangeNetwork={onChangeNetwork}
        port={port}
      />
    </Header>
    <H1>Accounts</H1>
    <AccountList>
      {wallets.length === 0 && (
        <Paragraph>
          No wallets on this network, click below to add one.
        </Paragraph>
      )}
      {wallets.map((wallet, index) => (
        <AccountListItem
          key={wallet.address}
          accountNumber={index + 1}
          address={wallet.address}
          status={getStatus(wallet, activeWallet)}
          onClick={() => onAccountSelect?.(wallet.address)}
        />
      ))}
      <IconButtonCenter size={48} {...makeClickable(onAddAccount)}>
        <Add />
      </IconButtonCenter>
    </AccountList>
  </AccountListWrapper>
)
