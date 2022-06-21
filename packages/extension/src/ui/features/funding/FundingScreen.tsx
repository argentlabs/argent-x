import { FC } from "react"
import { Link, Navigate } from "react-router-dom"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { useSelectedAccount } from "../accounts/accounts.state"
import CardSvg from "./card.svg"
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

  if (!account) {
    return <Navigate to={routes.accounts()} />
  }

  const isMainnet = account.networkId === "mainnet-alpha"
  const bridgeUrl = isMainnet
    ? "https://starkgate.starknet.io"
    : account.networkId === "goerli-alpha" &&
      "https://goerli.starkgate.starknet.io"

  const isDeprecatedAccount = false // isDeprecated(account) // Allow purchases on deprecated accounts as some people may want to buy some eth to transfer funds out of their wallet
  const allowFiatPurchase = isMainnet && !isDeprecatedAccount

  return (
    <>
      <IconBar close />
      <PageWrapper>
        <Title>How would you like to fund your account?</Title>
        <OptionsWrapper>
          {allowFiatPurchase ? (
            <a
              href={`http://argentx.banxa.com/?walletAddress=${normalizeAddress(
                account.address,
              )}`}
              target="_blank"
            >
              <Option
                title="Buy with card or bank transfer"
                description={"Purchase using fiat via Banxa"}
                icon={<CardSvg />}
              />
            </a>
          ) : (
            <Option
              title="Buy with card or bank transfer"
              description={
                !isMainnet
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
            />
          </Link>
          {bridgeUrl ? (
            <a href={bridgeUrl} target="_blank">
              <Option title="Bridge from Ethereum" icon={<EthereumSvg />} />
            </a>
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
