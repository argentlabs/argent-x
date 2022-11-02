import { FC } from "react"
import { Navigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { IconBar } from "../../components/IconBar"
import { routes } from "../../routes"
import { H1 } from "../../theme/Typography"
import { DeprecatedContainer } from "./AccountContainer"
import { AccountListHiddenScreenItem } from "./AccountListHiddenScreenItem"
import { isHiddenAccount, useAccountsOnNetwork } from "./accounts.state"

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 32px;
`

const AccountListWrapper = styled(DeprecatedContainer)`
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
  const { networkId } = useParams()
  const { switcherNetworkId } = useAppState()

  const hiddenAccounts = useAccountsOnNetwork({
    showHidden: true,
    networkId: networkId ?? switcherNetworkId,
  }).filter(isHiddenAccount)

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
