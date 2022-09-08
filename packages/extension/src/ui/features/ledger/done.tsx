import { FC } from "react"
import styled from "styled-components"

import { Title } from "../../components/Page"
import { P } from "../../theme/Typography"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { BlackCircle } from "./assets/BlackCircle"
import { ContentWrapper, LedgerPage } from "./Page"
import { StyledButton } from "./start"
import { useSelectedLedgerAccount } from "./store"

const SP = styled(P)`
  font-weight: 400;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 32px;
`

export const LedgerDoneScreen: FC = () => {
  const [selectedAccount] = useSelectedLedgerAccount()

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
        <Title style={{ margin: "32px 0" }}>Account added</Title>

        <SP>
          Your Ledger account has been successfully added and is available from
          the account list in your Argent X wallet
        </SP>

        <StyledButton
          onClick={async () => {
            window.close()
          }}
          variant="primary"
        >
          Finish
        </StyledButton>
      </ContentWrapper>
    </LedgerPage>
  )
}
