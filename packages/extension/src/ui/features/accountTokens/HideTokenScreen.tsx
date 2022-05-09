import React, { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { P } from "../../components/Typography"
import { FormError } from "../../components/Typography"
import { routes } from "../../routes"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"
import { removeToken } from "./tokens.state"
import { useTokens } from "./tokens.state"
import { BalanceAlert, TokenName, TokenTitle } from "./TokenScreen"

export const HideTokenAlert = BalanceAlert

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
