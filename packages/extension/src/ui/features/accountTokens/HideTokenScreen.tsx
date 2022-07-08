import { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"

import { Alert } from "../../components/Alert"
import { FormError, P } from "../../components/Typography"
import { routes } from "../../routes"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"
import { removeToken, useTokens } from "./tokens.state"

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
  color: #ffffff;
`

export const HideTokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const { tokens } = useTokens()
  const [error, setError] = useState("")

  const token = tokens.find(({ address }) => address === tokenAddress)
  if (!token) {
    return <Navigate to={routes.accountTokens()} />
  }

  const { name, image } = toTokenView(token)

  const handleSubmit = () => {
    try {
      removeToken(token.address)
      navigate(routes.accountTokens())
    } catch {
      setError("Token not hidden")
    }
  }

  return (
    <ConfirmScreen
      title="Hide token"
      confirmButtonText="Confirm"
      rejectButtonText="Cancel"
      onSubmit={handleSubmit}
    >
      <TokenTitle>
        <TokenIcon url={image} name={name} large />
        <TokenName>{name}</TokenName>
      </TokenTitle>
      {error && <FormError>{error}</FormError>}
      <HideTokenAlert>
        <P>
          To see this token again, you will need to add the token to your
          account.
        </P>
      </HideTokenAlert>
    </ConfirmScreen>
  )
}
