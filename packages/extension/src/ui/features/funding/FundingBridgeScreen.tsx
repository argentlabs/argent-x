import {
  BarBackButton,
  BarCloseButton,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import type { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { isDeprecated } from "../../../shared/wallet.service"
import { Option } from "../../components/Option"
import { TrackingLink } from "../../components/TrackingLink"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { isFeatureEnabled } from "@argent/x-shared"
import { getLayerSwapUrl } from "./utils"
import {
  EthereumLogo,
  OrbiterLogo,
  LayerswapLogo,
  RhinoFiLogo,
} from "@argent/x-ui/logos-deprecated"

export const FundingBridgeScreen: FC = () => {
  const account = useView(selectedAccountView)
  const navigate = useNavigate()

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"

  const isOrbiterEnabled = isFeatureEnabled(process.env.FEATURE_ORBITER)
  const isLayerswapEnabled = isFeatureEnabled(process.env.FEATURE_LAYERSWAP)
  const bridgeUrl = isMainnet
    ? "https://starkgate.starknet.io"
    : account.networkId === "sepolia-alpha" &&
      "https://sepolia.starkgate.starknet.io"

  const isDeprecatedAccount = isDeprecated(account) // Here should we check for Deprecated Account or doesn't matter?

  const allowOrbiter = isOrbiterEnabled && isMainnet && !isDeprecatedAccount
  const allowLayerswap = isLayerswapEnabled && isMainnet && !isDeprecatedAccount

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title="Bridge funds"
    >
      <CellStack>
        {bridgeUrl ? (
          <Option
            as={TrackingLink}
            href={bridgeUrl}
            targetBlank
            title="StarkGate"
            description="Bridge trustlessly from Ethereum"
            icon={<EthereumLogo />}
          />
        ) : (
          <Option
            title="Bridge from Ethereum"
            description="Not available for this network"
            icon={<EthereumLogo />}
            isDisabled
          />
        )}
        {allowLayerswap && (
          <Option
            as={TrackingLink}
            href={getLayerSwapUrl(account.address)}
            targetBlank
            title="Layerswap"
            description="Bridge from other chains"
            icon={<LayerswapLogo />}
          />
        )}
        {allowOrbiter && (
          <Option
            as={TrackingLink}
            href={`https://www.orbiter.finance/?referer=argent&dest=starknet&fixed=1&source=Mainnet`}
            targetBlank
            title="Orbiter.finance"
            description="Bridge from other chains"
            icon={<OrbiterLogo />}
          />
        )}
        <Option
          as={TrackingLink}
          href={`https://app.rhino.fi/bridge/?refId=PG_Argent`}
          targetBlank
          title="Rhino.fi"
          description="Bridge from other chains"
          icon={<RhinoFiLogo />}
        />
      </CellStack>
    </NavigationContainer>
  )
}
