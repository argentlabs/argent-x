import { FC } from "react"
import styled from "styled-components"

import { Account } from "../../Account"
import { PendingTransactions } from "./PendingTransactions"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 16px;
`

const Header = styled.h2`
  font-weight: 600;
  font-size: 32px;
  line-height: 38.4px;
  margin: 0;
`

interface AccountActivityProps {
  account: Account
}

export const AccountActivity: FC<AccountActivityProps> = ({ account }) => {
  return (
    <Container>
      <Header>Activity</Header>
      <PendingTransactions accountAddress={account.address} />
      Other transactions
    </Container>
  )
}
