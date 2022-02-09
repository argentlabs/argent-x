/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { BackButton } from "../components/BackButton"
import { Button, ButtonGroupVertical } from "../components/Button"
import { Header } from "../components/Header"
import { TokenIcon } from "../components/TokenIcon"
import { P } from "../components/Typography"
import { FormError, H2 } from "../components/Typography"
import { routes } from "../routes"
import { removeToken } from "../states/tokens"
import { useTokensWithBalance } from "../states/tokens"
import { toTokenView } from "../utils/tokens"
import {
  BalanceAlert,
  TokenName,
  TokenScreenWrapper,
  TokenTitle,
} from "./TokenScreen"

const HideTokenScreenWrapper = TokenScreenWrapper

export const HideTokenAlert = BalanceAlert

export const HideTokenScreen: FC = () => {
  const navigate = useNavigate()
  const { tokenAddress } = useParams()
  const { tokenDetails } = useTokensWithBalance()
  const [error, setError] = useState("")

  const token = tokenDetails.find(({ address }) => address === tokenAddress)
  if (!token) {
    return <></>
  }

  const { name } = toTokenView(token)

  return (
    <>
      <Header>
        <BackButton />
      </Header>

      <HideTokenScreenWrapper>
        <H2>Hide token</H2>
        <TokenTitle>
          <TokenIcon name={name} large />
          <TokenName>{name}</TokenName>
        </TokenTitle>
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            try {
              removeToken(token)
              navigate(routes.account)
            } catch (e) {
              setError("Token not hidden")
            }
          }}
        >
          {error && <FormError>{error}</FormError>}
          <HideTokenAlert>
            <P>
              To see this token again, you will need to add the token to your
              account.
            </P>
          </HideTokenAlert>
          <ButtonGroupVertical>
            <Button type="submit" disabled={false}>
              Confirm
            </Button>
          </ButtonGroupVertical>
        </form>
      </HideTokenScreenWrapper>
    </>
  )
}
