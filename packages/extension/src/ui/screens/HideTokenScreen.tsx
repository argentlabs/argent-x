import React, { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { TokenIcon } from "../components/TokenIcon"
import { P } from "../components/Typography"
import { FormError } from "../components/Typography"
import { routes } from "../routes"
import { removeToken } from "../states/tokens"
import { useTokensWithBalance } from "../states/tokens"
import { toTokenView } from "../utils/tokens"
import { ConfirmScreen } from "./ConfirmScreen"
import { BalanceAlert, TokenName, TokenTitle } from "./TokenScreen"

export const HideTokenAlert = BalanceAlert

export const HideTokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const { tokenDetails } = useTokensWithBalance()
  const [error, setError] = useState("")

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  if (!token) {
    return <Navigate to={routes.account()} />
  }

  const { name } = toTokenView(token)

  const handleSubmit = async () => {
    try {
      removeToken(token)
      navigate(routes.account())
    } catch (e) {
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
        <TokenIcon name={name} large />
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
