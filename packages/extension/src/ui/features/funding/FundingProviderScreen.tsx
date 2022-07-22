import { FC } from "react"
import { Navigate } from "react-router-dom"
import styled from "styled-components"
import A from "tracking-link"

import { IconBar } from "../../components/IconBar"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import { normalizeAddress } from "../../services/addresses"
import { trackAddFundsService } from "../../services/analytics"
import { useSelectedAccount } from "../accounts/accounts.state"
import { useIsMainnet } from "../networks/useNetworks"
import BanxaSvg from "./banxa.svg"
import RampSvg from "./ramp.svg"

const Title = styled.h1`
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 25px;
  text-align: center;
  margin: 0 0 36px 0;
`
export const FundingProviderScreen: FC = () => {
  const account = useSelectedAccount()
  const isMainnet = useIsMainnet()

  const isBanxaEnabled = (process.env.FEATURE_BANXA || "false") === "true"
  const allowFiatPurchase = account && isMainnet

  if (!allowFiatPurchase) {
    /** not possible via UI */
    return <Navigate to={routes.funding()} />
  }

  const normalizedAddress = normalizeAddress(account.address)
  const logoUrl = encodeURIComponent(
    `https://www.argent.xyz/icons/icon-512x512.png`,
  )

  const banxaUrl = `https://argentx.banxa.com/?walletAddress=${normalizedAddress}`
  const rampUrl = `https://buy.ramp.network/?swapAsset=STARKNET_*&userAddress=${normalizedAddress}&hostLogoUrl=${logoUrl}`

  return (
    <>
      <IconBar back close={routes.accountTokens()} />
      <PageWrapper>
        <Title>Choose provider</Title>
        <OptionsWrapper>
          {isBanxaEnabled && (
            <A
              href={banxaUrl}
              targetBlank
              onClick={trackAddFundsService("banxa", account.networkId)}
            >
              <Option
                title="Banxa"
                description="Card or bank transfer"
                icon={<BanxaSvg />}
              />
            </A>
          )}
          <A
            href={rampUrl}
            targetBlank
            onClick={trackAddFundsService("ramp", account.networkId)}
          >
            <Option
              title="Ramp"
              description="Card or bank transfer"
              icon={<RampSvg />}
            />
          </A>
        </OptionsWrapper>
      </PageWrapper>
    </>
  )
}
