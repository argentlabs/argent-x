import { BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { trackAddFundsService, usePageTracking } from "../../services/analytics"
import { useSelectedAccount } from "../accounts/accounts.state"
import CardSvg from "./card.svg"
import CoinbaseSvg from "./coinbase.svg"
import EthereumSvg from "./ethereum.svg"
import StarkNetSvg from "./starknet.svg"

export const Title = styled.h1`
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 25px;
  text-align: center;
  margin: 0 0 36px 0;
`

export const FundingScreen: FC = () => {
  const account = useSelectedAccount()
  const navigate = useNavigate()
  usePageTracking("addFunds", {
    networkId: account?.networkId || "unknown",
  })

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"
  const isBanxaEnabled = (process.env.FEATURE_BANXA || "false") === "true"
  const isLayerswapEnabled =
    (process.env.FEATURE_LAYERSWAP || "false") === "true"
  const isDeprecatedAccount = false // isDeprecated(account) // Allow purchases on deprecated accounts as some people may want to buy some eth to transfer funds out of their wallet
  const allowFiatPurchase = isBanxaEnabled && isMainnet && !isDeprecatedAccount
  const allowLayerswap = isLayerswapEnabled && isMainnet && !isDeprecatedAccount

  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      <PageWrapper>
        <Title>How would you like to fund your account?</Title>
        <OptionsWrapper>
          {allowFiatPurchase ? (
            <Link to={routes.fundingProvider()}>
              <Option
                title="Buy with card or bank transfer"
                icon={<CardSvg />}
              />
            </Link>
          ) : (
            <Option
              title="Buy with card or bank transfer"
              description={
                !isBanxaEnabled
                  ? "Is coming soon!"
                  : !isMainnet
                  ? "Only available on Mainnet"
                  : "Only available for new accounts"
              }
              icon={<CardSvg />}
              disabled
              hideArrow
            />
          )}
          <Link to={routes.fundingQrCode()}>
            <Option
              title="From another StarkNet account"
              icon={<StarkNetSvg />}
              hideArrow
            />
          </Link>
          {allowLayerswap && (
            <A
              href={`https://www.layerswap.io/?destNetwork=STARKNET_MAINNET&destAddress=${normalizeAddress(
                account.address,
              )}&lockNetwork=true&lockAddress=true&addressSource=argentx`}
              targetBlank
              onClick={trackAddFundsService("layerswap", account.networkId)}
            >
              <Option
                title="From an exchange"
                description={"Coinbase, Binance, etc"}
                icon={<CoinbaseSvg />}
                hideArrow
              />
            </A>
          )}
          <Option
            title="Bridge from Ethereum and other chains"
            icon={<EthereumSvg />}
            onClick={() => navigate(routes.fundingBridge())}
          />
        </OptionsWrapper>
      </PageWrapper>
    </NavigationContainer>
  )
}
