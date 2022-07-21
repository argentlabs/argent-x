import { FC } from "react"
import { Link, Navigate } from "react-router-dom"
import styled from "styled-components"
import A from "tracking-link"

import { IconBar } from "../../components/IconBar"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { trackAddFundsService, usePageTracking } from "../../services/analytics"
import { useSelectedAccount } from "../accounts/accounts.state"
import CardSvg from "./card.svg"
import CoinbaseSvg from "./coinbase.svg"
import EthereumSvg from "./ethereum.svg"
import StarkNetSvg from "./starknet.svg"

const Title = styled.h1`
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 25px;
  text-align: center;
  margin: 0 0 36px 0;
`

export const FundingScreen: FC = () => {
  const account = useSelectedAccount()
  usePageTracking("addFunds", {
    networkId: account?.networkId || "unknown",
  })

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"
  const bridgeUrl = isMainnet
    ? "https://starkgate.starknet.io"
    : account.networkId === "goerli-alpha" &&
      "https://goerli.starkgate.starknet.io"

  const isBanxaEnabled = (process.env.FEATURE_BANXA || "false") === "true"
  const isLayerswapEnabled =
    (process.env.FEATURE_LAYERSWAP || "false") === "true"
  const isDeprecatedAccount = false // isDeprecated(account) // Allow purchases on deprecated accounts as some people may want to buy some eth to transfer funds out of their wallet
  const allowFiatPurchase = isBanxaEnabled && isMainnet && !isDeprecatedAccount
  const allowLayerswap = isLayerswapEnabled && isMainnet && !isDeprecatedAccount

  return (
    <>
      <IconBar close />
      <PageWrapper>
        <Title>How would you like to fund your account?</Title>
        <OptionsWrapper>
          {allowFiatPurchase ? (
            <A
              href={`https://argentx.banxa.com/?walletAddress=${normalizeAddress(
                account.address,
              )}`}
              targetBlank
              onClick={trackAddFundsService("banxa", account.networkId)}
            >
              <Option
                title="Buy with card or bank transfer"
                icon={<CardSvg />}
                hideArrow
              />
            </A>
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
          {bridgeUrl ? (
            <A
              href={bridgeUrl}
              targetBlank
              onClick={trackAddFundsService("starkgate", account.networkId)}
            >
              <Option
                title="Bridge from Ethereum"
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
        </OptionsWrapper>
      </PageWrapper>
    </>
  )
}
