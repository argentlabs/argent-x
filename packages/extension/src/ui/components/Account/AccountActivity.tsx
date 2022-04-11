import { FC, Fragment } from "react"
import styled from "styled-components"
import useSWR from "swr"

import { Account } from "../../Account"
import { useAppState } from "../../states/app"
import { formatDateTime } from "../../utils/dates"
import { openVoyagerTransaction } from "../../utils/voyager.service"
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

export const AccountActivity: FC<AccountActivityProps> = ({ account }) => {
  const { switcherNetworkId } = useAppState()

  const { data: activity = {} } = useSWR(
    [account.address, switcherNetworkId, "activity"],
    fetchActivity,
    { refreshInterval: 60e3 /* 1 minute */ },
  )

  return (
    <Container>
      <Header>Activity</Header>
      <PendingTransactions accountAddress={account.address} />
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
    </Container>
  )
}
