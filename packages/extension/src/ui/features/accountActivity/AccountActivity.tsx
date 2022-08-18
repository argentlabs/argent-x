import { FC, Fragment, Suspense } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { ErrorBoundary } from "../../components/ErrorBoundary"
import { ErrorBoundaryFallback } from "../../components/ErrorBoundaryFallback"
import { Spinner } from "../../components/Spinner"
import { routes } from "../../routes"
import { formatDateTime } from "../../services/dates"
import { Account } from "../accounts/Account"
import { SectionHeader } from "../accounts/SectionHeader"
import { PendingTransactionsContainer } from "./PendingTransactions"
import {
  TransactionListItem,
  TransactionsListWrapper,
} from "./TransactionListItem"
import { DailyActivity, useActivity } from "./useActivity"

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

interface IAccountActivity {
  activity: DailyActivity
}

export const AccountActivity: FC<IAccountActivity> = ({ activity }) => {
  const navigate = useNavigate()
  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <SectionHeader>{dateLabel}</SectionHeader>
          <TransactionsListWrapper>
            {transactions.map(({ hash, date, meta, isRejected }) => (
              <TransactionListItem
                key={hash}
                hash={hash}
                status={isRejected ? "red" : undefined}
                meta={{ subTitle: formatDateTime(date), ...meta }}
                onClick={() => navigate(routes.transactionDetail(hash))}
              />
            ))}
          </TransactionsListWrapper>
        </Fragment>
      ))}
    </>
  )
}

interface IAccountActivityContainer {
  account: Account
}

export const AccountActivityContainer: FC<IAccountActivityContainer> = ({
  account,
}) => {
  const activity = useActivity(account)
  return (
    <Container>
      <Header>Activity</Header>
      <PendingTransactionsContainer account={account} />
      <ErrorBoundary
        fallback={
          <ErrorBoundaryFallback title="Seems like Voyager API is down..." />
        }
      >
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <AccountActivity activity={activity} />
        </Suspense>
      </ErrorBoundary>
    </Container>
  )
}
