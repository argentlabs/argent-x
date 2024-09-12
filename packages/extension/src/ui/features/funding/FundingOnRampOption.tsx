import { FC } from "react"
import { Link, useLocation } from "react-router-dom"
import { iconsDeprecated, logosDeprecated } from "@argent/x-ui"
import { Option } from "../../components/Options"
import { routes } from "../../../shared/ui/routes"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

const { CardIcon } = iconsDeprecated
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
      <Link to={routes.fundingProvider()} state={state}>
        <Option
          title="Buy with card or bank transfer"
          icon={<CardIcon width={6} height={6} />}
          description={
            isBanxaEnabled
              ? "Provided by Ramp, Banxa and Topper"
              : "Provided by Ramp and Topper"
          }
        />
      </Link>
    )
  }

  if (isSepolia) {
    return (
      <Link to={routes.fundingFaucetSepolia()} state={state}>
        <Option
          title="Get test ETH & STRK"
          icon={<StarknetLogo width={6} height={6} />}
          description="From Sepolia token faucet"
        />
      </Link>
    )
  }

  if (!isMainnet) {
    const faucetUrl = network?.faucetUrl

    return (
      <Link
        to={faucetUrl ? faucetUrl : routes.fundingFaucetFallback()}
        state={state}
        target={faucetUrl ? "_blank" : undefined}
      >
        <Option
          title="Get test ETH"
          icon={<StarknetLogo width={6} height={6} />}
          description="From Starknet token faucet"
        />
      </Link>
    )
  }
  return (
    <Option
      title="Buy with card or bank transfer"
      description={
        !isBanxaEnabled ? "Is coming soon!" : "Only available for new accounts"
      }
      icon={<CardIcon width={6} height={6} />}
      disabled
    />
  )
}
