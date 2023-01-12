import { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { removeToken } from "../../../shared/token/storage"
import { useToken } from "../../../shared/tokens.state"
import { useAppState } from "../../app.state"
import { Alert } from "../../components/Alert"
import { routes } from "../../routes"
import { FormError, P } from "../../theme/Typography"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"

export const HideTokenAlert = styled(Alert)`
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 20px;
`

export const TokenTitle = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`

export const TokenName = styled.h3`
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  color: ${({ theme }) => theme.text1};
`

export const HideTokenScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { tokenAddress } = useParams()
  const token = useToken({
    address: tokenAddress || "0x0",
    networkId: switcherNetworkId || "Unknown",
  })
  const [error, setError] = useState("")

  if (!token) {
    return <Navigate to={routes.accountTokens()} />
  }

  const { name, image } = toTokenView(token)

  const handleSubmit = () => {
    try {
      removeToken(token)
      navigate(routes.accountTokens())
    } catch {
      setError("Token not hidden")
    }
  }

  return (
    <DeprecatedConfirmScreen
      title="Hide token"
      confirmButtonText="Confirm"
      rejectButtonText="Cancel"
      onSubmit={handleSubmit}
    >
      <TokenTitle>
        <TokenIcon url={image} name={name} size={12} />
        <TokenName>{name}</TokenName>
      </TokenTitle>
      {error && <FormError>{error}</FormError>}
      <HideTokenAlert>
        <P>
          To see this token again, you will need to add the token to your
          account.
        </P>
      </HideTokenAlert>
    </DeprecatedConfirmScreen>
  )
}
