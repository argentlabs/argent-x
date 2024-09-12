import { Address } from "@argent/x-shared"
import { FC, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { clientTokenService } from "../../services/tokens"
import { HideTokenScreen } from "./HideTokenScreen"
import { useToken } from "./tokens.state"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"

export const HideTokenScreenContainer: FC = () => {
  const navigate = useNavigate()
  const selectedNetworkId = useView(selectedNetworkIdView)
  const { tokenAddress } = useParams<"tokenAddress">() as {
    tokenAddress: Address
  }
  const token = useToken({
    address: tokenAddress || "0x0",
    networkId: selectedNetworkId || "Unknown",
  })
  const [error, setError] = useState("")

  if (!token) {
    return <Navigate to={routes.accountTokens()} />
  }

  const { name, iconUrl } = clientTokenService.toTokenView(token)

  const handleSubmit = () => {
    try {
      void clientTokenService.removeToken(token)
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
