import { FC } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { P } from "../../components/Typography"
import { hideAccount } from "../../services/backgroundAccounts"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { recover } from "../recovery/recovery.service"

const StyledP = styled(P)`
  margin-bottom: 16px;
  line-height: 150%;
`

const AddressWrapper = styled.span`
  background-color: #333332;
  padding: 0 3px;
  border-radius: 3px;
  line-break: anywhere;
`

export const HideAccountScreen: FC = () => {
  const { accountAddress } = useParams<{ accountAddress: string }>()
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  if (!accountAddress) {
    return <></>
  }

  const handleSubmit = async () => {
    await hideAccount(accountAddress)

    navigate(
      await recover({ showAccountList: true, networkId: switcherNetworkId }),
    )
  }

  return (
    <ConfirmScreen
      title="Hide Account"
      confirmButtonText="Hide"
      rejectButtonText="Cancel"
      onSubmit={handleSubmit}
      onReject={() => navigate(-1)}
    >
      <StyledP>By confirming to hide, your account with address: </StyledP>
      <StyledP>
        <AddressWrapper>{accountAddress}</AddressWrapper>
      </StyledP>
      <StyledP>
        will be hidden. You might be able to unhide the account in future.
      </StyledP>
    </ConfirmScreen>
  )
}
