import AddIcon from "@mui/icons-material/Add"
import { FC, Suspense, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

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
  TokenTitle,
  TokenWrapper,
} from "../components/Token"
import { useStatus } from "../hooks/useStatus"
import { routes } from "../routes"
import { selectAccount, useAccount } from "../states/account"
import { getAccountName, useAccountMetadata } from "../states/accountMetadata"
import { useAppState } from "../states/app"
import { useWalletTransactions } from "../states/walletTransactions"
import { makeClickable } from "../utils/a11y"
import { getAccountImageUrl } from "../utils/wallets"
import { Wallet } from "../Wallet"

const AccountContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

export const AccountScreen: FC = () => {
  const navigate = useNavigate()
  const account = useAccount(selectAccount)

  useEffect(() => {
    if (!account) {
      navigate(routes.accounts())
    }
  }, [])

  if (!account) {
    return <></>
  }
  return <AccountScreenContent account={account} />
}

interface AccountScreenContentProps {
  account: Wallet
}

const AccountScreenContent: FC<AccountScreenContentProps> = ({ account }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const status = useStatus(account)
  const transactions = useWalletTransactions(account.address)
  const { accountNames, setAccountName } = useAccountMetadata()
  const pendingTransactions = useMemo(
    () =>
      transactions.filter(
        ({ status }) => status === "PENDING" || status === "RECEIVED",
      ),
    [transactions],
  )

  const showPendingTransactions = pendingTransactions.length > 0
  const accountName = getAccountName(account, accountNames)

  return (
    <AccountColumn>
      <Header>
        <ProfilePicture
          {...makeClickable(() => navigate(routes.accounts()))}
          src={getAccountImageUrl(accountName, account.address)}
        />
        <NetworkSwitcher />
      </Header>
      <AccountContent>
        <AccountSubHeader
          networkId={switcherNetworkId}
          status={status}
          accountName={accountName}
          walletAddress={account.address}
          onChangeName={(name) =>
            setAccountName(account.networkId, account.address, name)
          }
        />
        {showPendingTransactions && (
          <>
            <SectionHeader>Pending transactions</SectionHeader>
            <TransactionsWrapper>
              {pendingTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.hash}
                  txHash={transaction.hash}
                  meta={transaction.meta}
                  onClick={() => {
                    const { explorerUrl } = getNetwork(switcherNetworkId)
                    window
                      .open(`${explorerUrl}/tx/${transaction.hash}`, "_blank")
                      ?.focus()
                  }}
                />
              ))}
            </TransactionsWrapper>
          </>
        )}
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <TokenList
            walletAddress={account.address}
            canShowEmptyWalletAlert={!showPendingTransactions}
          />
          <TokenWrapper {...makeClickable(() => navigate(routes.newToken()))}>
            <AddTokenIconButton size={40}>
              <AddIcon />
            </AddTokenIconButton>
            <TokenTitle>Add token</TokenTitle>
          </TokenWrapper>
        </Suspense>
      </AccountContent>
    </AccountColumn>
  )
}
