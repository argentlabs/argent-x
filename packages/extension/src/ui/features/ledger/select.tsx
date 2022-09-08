import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Title } from "../../components/Page"
import { routes } from "../../routes"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { AccountSelect } from "../accounts/AccountSelect"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { BlackCircle } from "./assets/BlackCircle"
import { ContentWrapper, LedgerPage } from "./Page"
import { StyledButton } from "./start"
import { StepIndicator } from "./StepIndicator"
import { listOfAccounts, useSelectedLedgerAccount } from "./store"

export const LedgerSelectScreen: FC = () => {
  const navigate = useNavigate()

  const [selectedAccount, setSelectedAccount] = useSelectedLedgerAccount()

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
