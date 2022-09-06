import { FC } from "react"
import styled from "styled-components"

import { defaultNetwork } from "../../../shared/network"
import { Button } from "../../components/Button"
import { Title } from "../../components/Page"
import { P } from "../../theme/Typography"
import { getAccountImageUrl } from "../accounts/accounts.service"
import { ProfilePicture } from "../accounts/ProfilePicture"
import { BlackCircle } from "./assets/BlackCircle"
import { LedgerPage } from "./Page"

const StyledButton = styled(Button)`
  margin-top: 40px;
  max-width: 312px;
`

const SP = styled(P)`
  max-width: 420px;
  text-align: center;
  color: #8f8e8c;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;

  margin-bottom: 1em;
`

export const LedgerDoneScreen: FC = () => {
  const selectedAccount = {
    accountAddress:
      "0x04483e2798fb2763773775d9b055a87deca913806b9e41c18ffa67bd6d826641",
    accountName: "Ledger Account 1",
    accountType: "argent-ledger",
    networkId: defaultNetwork.id,
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
      <Title style={{ margin: "32px 0" }}>Account added</Title>

      <SP>
        Your Ledger account has been successfully added and available from the
        account list in your Argent X wallet.
      </SP>
      <SP>You can now close this tab</SP>

      <StyledButton
        onClick={async () => {
          window.close()
        }}
        variant="inverted"
      >
        Done
      </StyledButton>
    </LedgerPage>
  )
}
