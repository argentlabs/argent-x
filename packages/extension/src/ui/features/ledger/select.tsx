import { FC } from "react"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"

import { ContentWrapper } from "../../components/FullScreenPage"
import { Title } from "../../components/Page"
import { StepIndicator } from "../../components/StepIndicator"
import { routes } from "../../routes"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { AccountSelect } from "../accounts/AccountSelect"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { LoadingScreen } from "../actions/LoadingScreen"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerPage } from "./LedgerPage"
import { StyledButton } from "./start"
import { getListOfAccounts, useSelectedLedgerAccount } from "./store"

export const LedgerSelectScreen: FC = () => {
  const navigate = useNavigate()

  const [selectedAccount, setSelectedAccount] = useSelectedLedgerAccount()

  const { data: listOfAccounts } = useSWR(
    "listOfAccounts",
    () => getListOfAccounts(),
    {
      onSuccess(data) {
        if (!selectedAccount) {
          setSelectedAccount(data[0])
        }
      },
    },
  )

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
