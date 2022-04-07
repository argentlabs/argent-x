import { FC, useEffect, useState } from "react"
import styled from "styled-components"

import { Account } from "../../Account"
import { useAppState } from "../../states/app"
import { openVoyagerTransaction } from "../../utils/voyager.service"
import { DailyActivity } from "./accountActivity.model"
import { fetchActivity } from "./accountActivity.service"
import { PendingTransactions } from "./PendingTransactions"
import { SectionHeader } from "./SectionHeader"
import { TransactionItem, TransactionsWrapper } from "./TransactionItem"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin: 25px;
  text-align: center;
`

interface AccountActivityProps {
  account: Account
}

export const AccountActivity: FC<AccountActivityProps> = ({ account }) => {
  const { switcherNetworkId } = useAppState()
  const [activity, setActivity] = useState<DailyActivity>()

  useEffect(() => {
    ;(async () => {
      if (!activity) {
        setActivity(await fetchActivity(account.address, switcherNetworkId))
      }
    })()
  }, [activity])

  return (
    <Container>
      <Header>Activity</Header>
      <PendingTransactions accountAddress={account.address} />
      {Object.entries(activity || {}).map(([date, transactions]) => (
        <>
          <SectionHeader>{date}</SectionHeader>
          <TransactionsWrapper>
            {transactions.map(({ hash }) => (
              <TransactionItem
                key={hash}
                txHash={hash}
                onClick={() => openVoyagerTransaction(hash, switcherNetworkId)}
              />
            ))}
          </TransactionsWrapper>
        </>
      ))}
    </Container>
  )
}
