import { FC } from "react"
import { Navigate } from "react-router-dom"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { routes } from "../../routes"
import { H1 } from "../../theme/Typography"
import { Container } from "./AccountContainer"
import { AccountListHiddenScreenItem } from "./AccountListHiddenScreenItem"
import { isHiddenAccount, useAccounts } from "./accounts.state"

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled(Container)`
  display: flex;
  flex-direction: column;

  ${H1} {
    text-align: center;
  }

  > ${AccountList} {
    width: 100%;
  }
`

export const AccountListHiddenScreen: FC = () => {
  const hiddenAccounts = useAccounts({ showHidden: true }).filter(
    isHiddenAccount,
  )
  const hasHiddenAccounts = hiddenAccounts.length > 0
  if (!hasHiddenAccounts) {
    return <Navigate to={routes.accounts()} />
  }
  return (
    <AccountListWrapper>
      <IconBar back />
      <H1>Hidden Accounts</H1>
      <AccountList>
        {hiddenAccounts.map((account) => (
          <AccountListHiddenScreenItem
            key={account.address}
            account={account}
          />
        ))}
      </AccountList>
    </AccountListWrapper>
  )
}
