import {
  BarBackButton,
  BarCloseButton,
  NavigationContainer,
  logosDeprecated,
} from "@argent/x-ui"
import { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { isDeprecated } from "../../../shared/wallet.service"
import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { isFeatureEnabled } from "@argent/x-shared"
import { getLayerSwapUrl } from "./utils"
import { Grid } from "@chakra-ui/react"

const { EthereumLogo, OrbiterLogo, LayerswapLogo, RhinoFiLogo } =
  logosDeprecated

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
      <PageWrapper>
        <Grid templateColumns="1fr" gap={4}>
          {bridgeUrl ? (
            <A href={bridgeUrl} targetBlank>
              <Option
                title="StarkGate"
                description="Bridge trustlessly from Ethereum"
                icon={<EthereumLogo width={6} height={6} />}
              />
            </A>
          ) : (
            <Option
              title="Bridge from Ethereum"
              description="Not available for this network"
              icon={<EthereumLogo width={6} height={6} />}
              disabled
            />
          )}
          {allowLayerswap && (
            <A href={getLayerSwapUrl(account.address)} targetBlank>
              <Option
                title="Layerswap"
                description="Bridge from other chains"
                icon={<LayerswapLogo width={6} height={6} />}
              />
            </A>
          )}
          {allowOrbiter && (
            <A
              href={`https://www.orbiter.finance/?referer=argent&dest=starknet&fixed=1&source=Mainnet`}
              targetBlank
            >
              <Option
                title="Orbiter.finance"
                description="Bridge from other chains"
                icon={<OrbiterLogo width={6} height={6} />}
              />
            </A>
          )}
          <A href={`https://app.rhino.fi/bridge/?refId=PG_Argent`} targetBlank>
            <Option
              title="Rhino.fi"
              description="Bridge from other chains"
              icon={<RhinoFiLogo width={6} height={6} />}
            />
          </A>
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
