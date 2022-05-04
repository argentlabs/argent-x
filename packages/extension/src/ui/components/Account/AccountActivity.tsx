import { FC, Fragment, Suspense } from "react"
import styled from "styled-components"

import { Account } from "../../Account"
import { useActivity } from "../../hooks/useActivity"
import { useNetwork } from "../../hooks/useNetworks"
import { useAppState } from "../../states/app"
import { formatDateTime } from "../../utils/dates"
import { openVoyagerTransaction } from "../../utils/voyager.service"
import { ErrorBoundary } from "../ErrorBoundary"
import { ReportGmailerrorredIcon } from "../Icons/MuiIcons"
import { Spinner } from "../Spinner"
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
  const { network } = useNetwork(switcherNetworkId)

  const { activity } = useActivity(account.address, network)

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
                onClick={() => openVoyagerTransaction(hash, network)}
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
  const { network } = useNetwork(switcherNetworkId)

  // this is needed to keep swr mounted so it can retry the request
  useActivity(account.address, network, {
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
