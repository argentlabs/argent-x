import {
  BarBackButton,
  BarCloseButton,
  NavigationContainer,
  logos,
} from "@argent/ui"
import { isString } from "@sentry/utils"
import { colord } from "colord"
// import { colord } from "colord"
import { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { urlWithQuery } from "../../../shared/utils/url"
import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { routes } from "../../routes"
import { trackAddFundsService } from "../../services/analytics"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import { isFeatureEnabled, normalizeAddress } from "@argent/shared"
import { Grid } from "@chakra-ui/react"

const { RampLogo, BanxaLogo } = logos

// Can be used to highlight a specific option with a recommended badge
const RecommendedText = styled.span`
  background-color: ${({ theme }) =>
    colord(theme.green1).alpha(0.2).toRgbString()};
  color: ${({ theme }) => theme.green1};
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 11px;
  margin-left: 4px;
  font-weight: 500;
`

// show recommended badge between 31st October and 6th November
const showRecommended = () => {
  const today = new Date()
  const start = new Date("2022-10-31")
  const end = new Date("2022-11-06")
  return today >= start && today <= end
}

const BANXA_ENABLED = isFeatureEnabled(process.env.FEATURE_BANXA)
const RAMP_ENABLED =
  isString(process.env.RAMP_API_KEY) && process.env.RAMP_API_KEY.length > 0

export const FundingProviderScreen: FC = () => {
  const navigate = useNavigate()
  const account = useView(selectedAccountView)
  const isMainnet = useIsMainnet()

  const allowFiatPurchase = account && isMainnet
  const normalizedAddress = account ? normalizeAddress(account.address) : ""

  if (!allowFiatPurchase) {
    /** not possible via UI */
    return <Navigate to={routes.funding()} />
  }

  const banxaUrl = urlWithQuery("https://argentx.banxa.com/", {
    walletAddress: normalizedAddress,
  })

  const rampUrl = urlWithQuery("https://app.ramp.network/", {
    hostApiKey: process.env.RAMP_API_KEY as string,
    hostLogoUrl: "https://www.argent.xyz/icons/icon-512x512.png",
    swapAsset: "STARKNET_*",
    userAddress: normalizedAddress,
  })

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
      title="Choose provider"
    >
      <PageWrapper>
        <Grid templateColumns="1fr" gap={4}>
          {RAMP_ENABLED && (
            <A
              href={rampUrl}
              targetBlank
              onClick={trackAddFundsService("ramp", account.networkId)}
            >
              <Option
                title={
                  <>
                    Ramp
                    {showRecommended() && (
                      <RecommendedText>Recommended</RecommendedText>
                    )}
                  </>
                }
                description="Card or bank transfer"
                icon={<RampLogo width={6} height={6} />}
              />
            </A>
          )}
          {BANXA_ENABLED && (
            <A
              href={banxaUrl}
              targetBlank
              onClick={trackAddFundsService("banxa", account.networkId)}
            >
              <Option
                title="Banxa"
                description="Card or bank transfer"
                icon={<BanxaLogo width={6} height={6} />}
              />
            </A>
          )}
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
