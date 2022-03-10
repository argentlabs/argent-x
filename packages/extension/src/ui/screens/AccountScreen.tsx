import AddIcon from "@mui/icons-material/Add"
import { FC, Suspense, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { getNetwork } from "../../shared/networks"
import { Account } from "../Account"
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
import { useAccountStatus } from "../hooks/useAccountStatus"
import { routes } from "../routes"
import { selectAccount, useAccount } from "../states/account"
import { getAccountName, useAccountMetadata } from "../states/accountMetadata"
import { useAccountTransactions } from "../states/accountTransactions"
import { useAppState } from "../states/app"
import { useLocalhostPort } from "../states/localhostPort"
import { makeClickable } from "../utils/a11y"
import { connectAccount, getAccountImageUrl } from "../utils/accounts"

const AccountContent = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
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
  account: Account
}

const AccountScreenContent: FC<AccountScreenContentProps> = ({ account }) => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { localhostPort } = useLocalhostPort()
  const status = useAccountStatus(account)
  const transactions = useAccountTransactions(account.address)
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

  useEffect(() => {
    connectAccount(account, switcherNetworkId, localhostPort)
  }, [account, switcherNetworkId, localhostPort])

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
          accountAddress={account.address}
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
            accountAddress={account.address}
            canShowEmptyAccountAlert={!showPendingTransactions}
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
