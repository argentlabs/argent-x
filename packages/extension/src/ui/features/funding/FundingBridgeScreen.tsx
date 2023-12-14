import {
  BarBackButton,
  BarCloseButton,
  NavigationContainer,
  logos,
} from "@argent/ui"
import { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { isDeprecated } from "../../../shared/wallet.service"
import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { routes } from "../../routes"
import { trackAddFundsService } from "../../services/analytics"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { isFeatureEnabled } from "@argent/shared"
import { getLayerSwapUrl } from "./utils"
import { Grid } from "@chakra-ui/react"

const { EthereumLogo, OrbiterLogo, LayerswapLogo } = logos

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
    : account.networkId === "goerli-alpha" &&
      "https://goerli.starkgate.starknet.io"

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
            <A
              href={bridgeUrl}
              targetBlank
              onClick={trackAddFundsService("starkgate", account.networkId)}
            >
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
            <A
              href={getLayerSwapUrl(account.address)}
              targetBlank
              onClick={trackAddFundsService("layerswap", account.networkId)}
            >
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
              onClick={trackAddFundsService("orbiter", account.networkId)}
            >
              <Option
                title="Orbiter.finance"
                description="Bridge from other chains"
                icon={<OrbiterLogo width={6} height={6} />}
              />
            </A>
          )}
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
