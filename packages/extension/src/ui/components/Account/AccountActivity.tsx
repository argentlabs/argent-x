import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred"
import { FC, Fragment, Suspense } from "react"
import styled from "styled-components"
import useSWR from "swr"

import { Account } from "../../Account"
import { useAppState } from "../../states/app"
import { formatDateTime } from "../../utils/dates"
import { openVoyagerTransaction } from "../../utils/voyager.service"
import { ErrorBoundary } from "../ErrorBoundary"
import { Spinner } from "../Spinner"
import { fetchActivity } from "./accountActivity.service"
import { PendingTransactions } from "./PendingTransactions"
import { SectionHeader } from "./SectionHeader"
import { TransactionItem, TransactionsWrapper } from "./TransactionItem"

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

  const { data: activity = {} } = useSWR(
    [account.address, switcherNetworkId, "activity"],
    fetchActivity,
    {
      refreshInterval: 60e3 /* 1 minute */,
      suspense: true,
    },
  )

  return (
    <>
      {Object.entries(activity).map(([dateLabel, transactions]) => (
        <Fragment key={dateLabel}>
          <SectionHeader>{dateLabel}</SectionHeader>
          <TransactionsWrapper>
            {transactions.map(({ hash, date }) => (
              <TransactionItem
                key={hash}
                hash={hash}
                meta={{ subTitle: formatDateTime(date) }}
                onClick={() => openVoyagerTransaction(hash, switcherNetworkId)}
              />
            ))}
          </TransactionsWrapper>
        </Fragment>
      ))}
    </>
  )
}

const ActivityError: FC<AccountActivityProps> = ({ account }) => {
  const { switcherNetworkId } = useAppState()

  // this is needed to keep swr mounted so it can retry the request
  useSWR([account.address, switcherNetworkId, "activity"], fetchActivity, {
    suspense: false,
    errorRetryInterval: 30e3 /* 30 seconds */,
  })

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ReportGmailerrorredIcon
        style={{
          color: "red",
          fontSize: "64px",
          marginBottom: "16px",
        }}
      />
      <h3>Seems like Voyager API is down...</h3>
    </div>
  )
}

export const AccountActivity: FC<AccountActivityProps> = ({ account }) => {
  return (
    <Container>
      <Header>Activity</Header>
      <PendingTransactions accountAddress={account.address} />
      <ErrorBoundary fallback={<ActivityError account={account} />}>
        <Suspense fallback={<Spinner size={64} style={{ marginTop: 40 }} />}>
          <Activity account={account} />
        </Suspense>
      </ErrorBoundary>
    </Container>
  )
}
