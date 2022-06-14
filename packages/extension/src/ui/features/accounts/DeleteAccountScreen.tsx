import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { P } from "../../components/Typography"
import { deleteAccount } from "../../services/backgroundAccounts"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { recover } from "../recovery/recovery.service"

const StyledP = styled(P)`
  margin-bottom: 10px;
  line-height: 150%;
`

const AddressWrapper = styled.span`
  background-color: #333332;
  padding: 0 3px;
  border-radius: 3px;
  line-break: anywhere;
`

export const DeleteAccountScreen: FC = () => {
  const { accountAddress } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  if (!accountAddress) {
    return <></>
  }

  const handleSubmit = async () => {
    await deleteAccount(accountAddress)

    navigate(
      await recover({ showAccountList: true, networkId: switcherNetworkId }),
    )
  }

  return (
    <ConfirmScreen
      title="Delete Account"
      confirmButtonText="Delete"
      rejectButtonText="Cancel"
      onSubmit={handleSubmit}
      onReject={() => navigate(-1)}
    >
      <StyledP>By confirming to delete, your account with address: </StyledP>

      <StyledP>
        <AddressWrapper>{accountAddress}</AddressWrapper>
      </StyledP>

      <StyledP>
        will be deleted permanently. You will not be able to recover the account
        in future.
      </StyledP>
    </ConfirmScreen>
  )
}
