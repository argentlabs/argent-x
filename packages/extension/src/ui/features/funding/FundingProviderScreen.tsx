import {
  BarBackButton,
  BarCloseButton,
  NavigationContainer,
  logosDeprecated,
} from "@argent/x-ui"
import { colord } from "colord"
import { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { isFeatureEnabled, normalizeAddress } from "@argent/x-shared"
import { Grid } from "@chakra-ui/react"
import { isString } from "lodash-es"
import useSWR from "swr"
import { routes } from "../../../shared/ui/routes"
import { urlWithQuery } from "../../../shared/utils/url"
import { Option } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { A } from "../../components/TrackingLink"
import { clientOnRampService } from "../../services/onRamp"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"

const { RampLogo, BanxaLogo, TopperLogo } = logosDeprecated

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
  isString(process.env.RAMP_API_KEY) &&
  process.env.RAMP_API_KEY &&
  process.env?.RAMP_API_KEY.length > 0
const TOPPER_ENABLED = isString(process.env.TOPPER_PEM_KEY)

export const FundingProviderScreen: FC = () => {
  const navigate = useNavigate()
  const account = useView(selectedAccountView)
  const isMainnet = useIsMainnet()

  const allowFiatPurchase = account && isMainnet
  const normalizedAddress = account ? normalizeAddress(account.address) : ""
  const { data: topperUrl } = useSWR(["topperUrl", normalizedAddress], () => {
    return (
      normalizedAddress && clientOnRampService.getTopperUrl(normalizedAddress)
    )
  })

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
            <A href={rampUrl} targetBlank>
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
            <A href={banxaUrl} targetBlank>
              <Option
                title="Banxa"
                description="Card or bank transfer"
                icon={<BanxaLogo width={6} height={6} />}
              />
            </A>
          )}
          {TOPPER_ENABLED && topperUrl && (
            <A href={topperUrl} targetBlank>
              <Option
                title="Topper"
                description="Card or bank transfer"
                icon={<TopperLogo width={6} height={6} />}
              />
            </A>
          )}
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
