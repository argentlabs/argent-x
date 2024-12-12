import type { FC } from "react"
import { Link, useLocation } from "react-router-dom"
import { icons, logosDeprecated } from "@argent/x-ui"
import { Option } from "../../components/Option"
import { routes } from "../../../shared/ui/routes"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

const { CardSecondaryIcon } = icons
const { StarknetLogo } = logosDeprecated

interface FundingOnRampOptionProps {
  allowFiatPurchase: boolean
  isMainnet: boolean
  isSepolia: boolean
  isBanxaEnabled: boolean
}

export const FundingOnRampOption: FC<FundingOnRampOptionProps> = ({
  allowFiatPurchase,
  isMainnet,
  isSepolia,
  isBanxaEnabled,
}) => {
  const { state } = useLocation()
  const network = useCurrentNetwork()

  if (allowFiatPurchase) {
    return (
      <Option
        as={Link}
        to={routes.fundingProvider()}
        state={state}
        title="Buy with card or bank transfer"
        icon={<CardSecondaryIcon />}
        description={
          isBanxaEnabled
            ? "Provided by Ramp, Banxa and Topper"
            : "Provided by Ramp and Topper"
        }
      />
    )
  }

  if (isSepolia) {
    return (
      <Option
        as={Link}
        to={routes.fundingFaucetSepolia()}
        state={state}
        title="Get test ETH & STRK"
        icon={<StarknetLogo />}
        description="From Sepolia token faucet"
      />
    )
  }

  if (!isMainnet) {
    const faucetUrl = network?.faucetUrl

    return (
      <Option
        as={Link}
        to={faucetUrl ? faucetUrl : routes.fundingFaucetFallback()}
        state={state}
        target={faucetUrl ? "_blank" : undefined}
        title="Get test ETH"
        icon={<StarknetLogo />}
        description="From Starknet token faucet"
      />
    )
  }

  return (
    <Option
      title="Buy with card or bank transfer"
      description={
        !isBanxaEnabled ? "Is coming soon!" : "Only available for new accounts"
      }
      icon={<CardSecondaryIcon />}
      isDisabled
    />
  )
}