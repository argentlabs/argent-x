import { Address } from "@argent/x-shared"
import { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { useAppState } from "../../app.state"
import { routes } from "../../routes"
import { tokenService } from "../../services/tokens"
import { HideTokenScreen } from "./HideTokenScreen"
import { useToken } from "./tokens.state"

export const HideTokenScreenContainer: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()
  const { tokenAddress } = useParams<"tokenAddress">() as {
    tokenAddress: Address
  }
  const token = useToken({
    address: tokenAddress || "0x0",
    networkId: switcherNetworkId || "Unknown",
  })
  const [error, setError] = useState("")

  if (!token) {
    return <Navigate to={routes.accountTokens()} />
  }

  const { name, iconUrl } = tokenService.toTokenView(token)

  const handleSubmit = () => {
    try {
      void tokenService.removeToken(token)
      navigate(routes.accountTokens())
    } catch {
      setError("Token not hidden")
    }
  }

  return (
    <HideTokenScreen
      handleSubmit={handleSubmit}
      name={name}
      image={iconUrl}
      error={error}
    />
  )
}
