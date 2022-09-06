import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { defaultNetwork } from "../../../shared/network"
import { Button } from "../../components/Button"
import { Title } from "../../components/Page"
import { routes } from "../../routes"
import { IAccountListItem } from "../accounts/AccountListItem"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { AccountSelect } from "../accounts/AccountSelect"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerPage } from "./Page"

const StyledButton = styled(Button)`
  margin-top: 8px;
  max-width: 312px;
`

export const LedgerSelectScreen: FC = () => {
  const navigate = useNavigate()

  const listOfAccounts: IAccountListItem[] = [
    {
      accountAddress:
        "0x04483e2798fb2763773775d9b055a87deca913806b9e41c18ffa67bd6d826641",
      accountName: "Ledger Account 1",
      accountType: "argent-ledger",
      networkId: defaultNetwork.id,
    },
  ]

  const selectedAccount = listOfAccounts[0]

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
      <Title style={{ margin: "32px 0" }}>Select an account</Title>

      <AccountSelect
        style={{ width: 380, marginBottom: 32 }}
        accounts={listOfAccounts}
        selectedAccount={selectedAccount}
      />

      <StyledButton
        onClick={async () => {
          navigate(routes.ledgerDone())
        }}
        variant="inverted"
      >
        Continue
      </StyledButton>
    </LedgerPage>
  )
}
