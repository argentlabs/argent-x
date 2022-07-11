import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { AccountAddress, AccountName } from "../../components/Address"
import { P } from "../../components/Typography"
import { formatFullAddress } from "../../services/addresses"
import { deleteAccount, hideAccount } from "../../services/backgroundAccounts"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { recover } from "../recovery/recovery.service"
import { getAccountName, useAccountMetadata } from "./accountMetadata.state"
import { useAccount } from "./accounts.state"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 150%;
`

const AddressWrapper = styled.span`
  margin: 16px 0 32px;
  padding: 16px 16px 24px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  overflow: hidden;
  text-align: center;

  > ${AccountName} {
    margin-top: 0;
  }

  > ${AccountAddress} {
    color: ${({ theme }) => theme.text1};
  }
`

export const HideOrDeleteAccountConfirmScreen: FC<{
  mode: "hide" | "delete"
}> = ({ mode }) => {
  const { accountAddress = "" } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { accountNames } = useAccountMetadata()
  const account = useAccount({
    address: accountAddress,
    networkId: switcherNetworkId,
  })

  if (!accountAddress || !account) {
    return <></>
  }

  const handleSubmit = async () => {
    if (mode === "hide") {
      await hideAccount(accountAddress, switcherNetworkId)
    }
    if (mode === "delete") {
      await deleteAccount(accountAddress, switcherNetworkId)
    }

    navigate(
      await recover({ showAccountList: true, networkId: switcherNetworkId }),
    )
  }

  return (
    <ConfirmScreen
      title={mode === "hide" ? "Hide Account" : "Delete Account"}
      confirmButtonText={mode === "hide" ? "Hide" : "Delete"}
      confirmButtonBackgroundColor="#C12026"
      rejectButtonText="Cancel"
      onSubmit={handleSubmit}
      onReject={() => navigate(-1)}
    >
      <StyledP>
        {mode === "hide"
          ? "You are about to hide the following account:"
          : "You are about to delete the following account:"}
      </StyledP>
      <AddressWrapper>
        <AccountName>{getAccountName(account, accountNames)}</AccountName>
        <AccountAddress>{formatFullAddress(account.address)}</AccountAddress>
      </AddressWrapper>
      <StyledP>
        {mode === "hide"
          ? "You will be able to unhide the account by recovering your wallet. In the future you will also be able to unhide the account in the settings of the extension."
          : "You will not be able to recover this account in the future."}
      </StyledP>
    </ConfirmScreen>
  )
}
