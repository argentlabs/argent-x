import { BarBackButton, BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { isDeprecated } from "../../../shared/wallet.service"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { routes } from "../../routes"
import { trackAddFundsService } from "../../services/analytics"
import { useSelectedAccount } from "../accounts/accounts.state"
import EthereumSvg from "./ethereum.svg"
import { Title } from "./FundingScreen"
import OrbiterSvg from "./orbiter.svg"

export const FundingBridgeScreen: FC = () => {
  const account = useSelectedAccount()
  const navigate = useNavigate()

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"

  const isOrbiterEnabled = (process.env.FEATURE_ORBITER || "false") === "true"
  const bridgeUrl = isMainnet
    ? "https://starkgate.starknet.io"
    : account.networkId === "goerli-alpha" &&
      "https://goerli.starkgate.starknet.io"

  const isDeprecatedAccount = isDeprecated(account) // Here should we check for Deprecated Account or doesn't matter?

  const allowOrbiter = isOrbiterEnabled && isMainnet && !isDeprecatedAccount

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      <PageWrapper>
        <Title>Bridge your assets</Title>
        <OptionsWrapper>
          {bridgeUrl ? (
            <A
              href={bridgeUrl}
              targetBlank
              onClick={trackAddFundsService("starkgate", account.networkId)}
            >
              <Option
                title="StarkGate"
                description="Bridge trustlessly from Ethereum"
                icon={<EthereumSvg />}
                hideArrow
              />
            </A>
          ) : (
            <Option
              title="Bridge from Ethereum"
              description="Not available for this network"
              icon={<EthereumSvg />}
              disabled
              hideArrow
            />
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
                icon={<OrbiterSvg />}
                hideArrow
              />
            </A>
          )}
        </OptionsWrapper>
      </PageWrapper>
    </NavigationContainer>
  )
}
