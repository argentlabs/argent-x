import {
  BarBackButton,
  BarCloseButton,
  CellStack,
  NavigationContainer,
  P3,
} from "@argent/x-ui"
import type { FC } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import type { Address } from "@argent/x-shared"
import {
  isEqualAddress,
  isFeatureEnabled,
  normalizeAddress,
} from "@argent/x-shared"
import { isString } from "lodash-es"
import useSWR from "swr"
import { routes } from "../../../shared/ui/routes"
import { urlWithQuery } from "../../../shared/utils/url"
import { Option } from "../../components/Option"
import { TrackingLink } from "../../components/TrackingLink"
import { clientOnRampService } from "../../services/onRamp"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useIsMainnet } from "../networks/hooks/useIsMainnet"
import type { TextProps } from "@chakra-ui/react"
import { PROVIDER_TOKENS } from "./constants"
import { useRouteTokenAddress } from "../../hooks/useRoute"
import { useToken } from "../accountTokens/tokens.state"
import { selectedNetworkIdView } from "../../views/network"

import { RampLogo, BanxaLogo, TopperLogo } from "@argent/x-ui/logos-deprecated"

function RecommendedText(props: TextProps) {
  return (
    <P3
      as="span"
      bgColor="surface-success-default"
      color="text-success"
      px={1}
      py={0.5}
      ml={1}
      rounded="base"
      {...props}
    />
  )
}

// show recommended badge between 31st October and 6th November
const showRecommended = () => {
  const today = new Date()
  const start = new Date("2022-10-31")
  const end = new Date("2022-11-06")
  return today >= start && today <= end
}
const isBanxaEnabled = (tokenAddress?: Address) =>
  isFeatureEnabled(process.env.FEATURE_BANXA) &&
  (!tokenAddress ||
    PROVIDER_TOKENS.banxa.some((address) =>
      isEqualAddress(address, tokenAddress),
    ))

const isRampEnabled = (tokenAddress?: Address) =>
  isString(process.env.RAMP_API_KEY) &&
  process.env.RAMP_API_KEY &&
  process.env?.RAMP_API_KEY.length > 0 &&
  (!tokenAddress ||
    PROVIDER_TOKENS.ramp.some((address) =>
      isEqualAddress(address, tokenAddress),
    ))

const isTopperEnabled = (tokenAddress?: Address) =>
  isString(process.env.TOPPER_PEM_KEY) &&
  (!tokenAddress ||
    PROVIDER_TOKENS.topper.some((address) =>
      isEqualAddress(address, tokenAddress),
    ))

export const FundingProviderScreen: FC = () => {
  const navigate = useNavigate()
  const account = useView(selectedAccountView)
  const isMainnet = useIsMainnet()

  const tokenAddress = useRouteTokenAddress()
  const networkId = useView(selectedNetworkIdView)
  const token = useToken({
    address: tokenAddress as Address,
    networkId,
  })

  const allowFiatPurchase = account && isMainnet
  const normalizedAddress = account ? normalizeAddress(account.address) : ""
  const { data: topperUrl } = useSWR(["topperUrl", normalizedAddress], () => {
    const isTopperToken = PROVIDER_TOKENS.topper.some((address) =>
      isEqualAddress(address, tokenAddress),
    )
    return (
      normalizedAddress &&
      clientOnRampService.getTopperUrl(
        normalizedAddress,
        isTopperToken ? token?.symbol : undefined,
      )
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
      <CellStack>
        {isRampEnabled(tokenAddress) && (
          <Option
            as={TrackingLink}
            href={rampUrl}
            targetBlank
            title={
              <>
                Ramp Network
                {showRecommended() && (
                  <RecommendedText>Recommended</RecommendedText>
                )}
              </>
            }
            description="Card or bank transfer"
            icon={<RampLogo />}
          />
        )}
        {isBanxaEnabled(tokenAddress) && (
          <Option
            as={TrackingLink}
            href={banxaUrl}
            targetBlank
            title="Banxa"
            description="Card or bank transfer"
            icon={<BanxaLogo />}
          />
        )}
        {isTopperEnabled(tokenAddress) && topperUrl && (
          <Option
            as={TrackingLink}
            href={topperUrl}
            targetBlank
            title="Topper"
            description="Card or bank transfer"
            icon={<TopperLogo />}
          />
        )}
      </CellStack>
    </NavigationContainer>
  )
}
