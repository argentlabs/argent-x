import { FC, Suspense, useMemo } from "react"
import styled from "styled-components"

import Add from "../../assets/add.svg"
import { getNetwork } from "../../shared/networks"
import { AccountColumn } from "../components/Account/AccountColumn"
import { AccountSubHeader } from "../components/Account/AccountSubheader"
import { ProfilePicture } from "../components/Account/ProfilePicture"
import { SectionHeader } from "../components/Account/SectionHeader"
import { TokenList } from "../components/Account/TokenList"
import {
  TransactionItem,
  TransactionsWrapper,
} from "../components/Account/Transactions"
import { Header } from "../components/Header"
import { NetworkSwitcher } from "../components/NetworkSwitcher"
import { Spinner } from "../components/Spinner"
import {
  AddTokenIconButton,
  TokenAction,
  TokenTitle,
  TokenWrapper,
} from "../components/Token"
import { useStatus } from "../hooks/useStatus"
import { useWalletTransactions } from "../states/walletTransactions"
import { makeClickable } from "../utils/a11y"
import { TokenDetails } from "../utils/tokens"
import { getAccountImageUrl } from "../utils/wallet"
import { Wallet } from "../Wallet"

const AccountContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

interface AccountScreenProps {
  wallet: Wallet
  accountNumber: number
  onShowAccountList?: () => void
  onShowToken: (token: TokenDetails) => void
  onAddToken?: () => void
  onAction?: (token: string, action: TokenAction) => Promise<void> | void
  networkId: string
  onChangeNetwork: (networkId: string) => Promise<void> | void
}

export const AccountScreen: FC<AccountScreenProps> = ({
  wallet,
  accountNumber,
  onShowAccountList,
  onShowToken,
  onAddToken,
  onAction,
  networkId,
  onChangeNetwork,
}) => {
  const status = useStatus(wallet)
  const transactions = useWalletTransactions(wallet.address)

  const pendingTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.status === "PENDING" || transaction.status === "RECEIVED",
      ),
    [transactions],
  )
  const showPendingTransactions = pendingTransactions.length > 0

  return (
    <AccountColumn>
      <Header>
        <ProfilePicture
          {...makeClickable(onShowAccountList)}
          src={getAccountImageUrl(accountNumber)}
        />
        <NetworkSwitcher
          networkId={networkId}
          onChangeNetwork={onChangeNetwork}
        />
      </Header>
      <AccountContent>
        <AccountSubHeader
          networkId={networkId}
          status={status}
          accountNumber={accountNumber}
          walletAddress={wallet.address}
        />
        {showPendingTransactions && (
          <>
            <SectionHeader>Pending transactions</SectionHeader>
            <TransactionsWrapper>
              {pendingTransactions.map((tx) => (
                <TransactionItem
                  key={tx.hash}
                  txHash={tx.hash}
                  meta={tx.meta}
                  onClick={() => {
                    const { explorerUrl } = getNetwork(networkId)
                    window
                      .open(`${explorerUrl}/tx/${tx.hash}`, "_blank")
                      ?.focus()
                  }}
                />
              ))}
            </TransactionsWrapper>
          </>
        )}
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <TokenList
            networkId={networkId}
            onAction={onAction}
            onShowToken={onShowToken}
            walletAddress={wallet.address}
            canShowEmptyWalletAlert={!showPendingTransactions}
          />
          <TokenWrapper {...makeClickable(onAddToken)}>
            <AddTokenIconButton size={40}>
              <Add />
            </AddTokenIconButton>
            <TokenTitle>Add token</TokenTitle>
          </TokenWrapper>
        </Suspense>
      </AccountContent>
    </AccountColumn>
  )
}
