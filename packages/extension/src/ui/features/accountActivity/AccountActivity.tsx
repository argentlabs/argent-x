import { FC, Fragment, Suspense } from "react"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { Spinner } from "../../components/Spinner"
import { formatDateTime } from "../../services/dates"
import { openVoyagerTransaction } from "../../services/voyager.service"
import { Account } from "../accounts/Account"
import { SectionHeader } from "../accounts/SectionHeader"
import { useNetwork } from "../networks/useNetworks"
import { PendingTransactions } from "./PendingTransactions"
import { TransactionItem, TransactionsWrapper } from "./TransactionItem"
import { useActivity } from "./useActivity"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  margin-bottom: 68px;
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin-bottom: 25px;
  text-align: center;
`

interface AccountActivityProps {
  account: Account
}

const Activity: FC<AccountActivityProps> = ({ account }) => {
  const { switcherNetworkId } = useAppState()
  const { network } = useNetwork(switcherNetworkId)

  const activity = useActivity(account.address)

  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <SectionHeader>{dateLabel}</SectionHeader>
          <TransactionsWrapper>
            {transactions.map(({ hash, date, meta, isRejected }) => (
              <TransactionItem
                key={hash}
                hash={hash}
                status={isRejected ? "red" : undefined}
                meta={{ subTitle: formatDateTime(date), ...meta }}
                onClick={() => openVoyagerTransaction(hash, network)}
              />
            ))}
          </TransactionsWrapper>
        </Fragment>
      ))}
    </>
  )
}

export const AccountActivity: FC<AccountActivityProps> = ({ account }) => (
  <Container>
    <Header>Activity</Header>
    <PendingTransactions accountAddress={account.address} />
    <ErrorBoundary
      fallback={
        <ErrorBoundaryFallback title="Seems like Voyager API is down..." />
      }
    >
      <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
        <Activity account={account} />
      </Suspense>
    </ErrorBoundary>
  </Container>
)
