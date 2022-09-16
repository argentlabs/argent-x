import { FC, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Title } from "../../components/Page"
import { routes } from "../../routes"
import { IAccountListItem } from "../accounts/AccountListItem"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { AccountSelect } from "../accounts/AccountSelect"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { LoadingScreen } from "../actions/LoadingScreen"
import { BlackCircle } from "./assets/BlackCircle"
import { ContentWrapper, LedgerPage } from "./Page"
import { StyledButton } from "./start"
import { StepIndicator } from "./StepIndicator"
import { getListOfAccounts, useSelectedLedgerAccount } from "./store"

export const LedgerSelectScreen: FC = () => {
  const navigate = useNavigate()

  const [listOfAccounts, setListOfAccounts] = useState<IAccountListItem[]>([])
  const [selectedAccount, setSelectedAccount] = useSelectedLedgerAccount()

  const isRunning = useRef(false)
  useEffect(() => {
    if (isRunning.current) {
      return
    }
    isRunning.current = true
    getListOfAccounts().then((accounts) => {
      setListOfAccounts(accounts)
      setSelectedAccount(accounts[0])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!listOfAccounts || !selectedAccount) {
    return <LoadingScreen />
  }

  return (
    <LedgerPage>
      <BlackCircle>
        <ProfilePicture
          src={getAccountImageUrl(selectedAccount.accountName, {
            address: selectedAccount.accountAddress,
            networkId: selectedAccount.networkId,
          })}
          size="xxl"
        />
      </BlackCircle>
      <ContentWrapper>
        <StepIndicator length={3} currentIndex={1} />

        <Title style={{ margin: "32px 0" }}>Select an account</Title>

        <AccountSelect
          style={{ marginBottom: 32 }}
          accounts={listOfAccounts}
          selectedAccount={selectedAccount}
          onSelectedAccountChange={setSelectedAccount}
        />

        <StyledButton
          onClick={async () => {
            navigate(routes.ledgerDone())
          }}
          variant="primary"
        >
          Add account
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )
}
