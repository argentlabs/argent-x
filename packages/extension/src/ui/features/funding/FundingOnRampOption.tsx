import { FC } from "react"
import { Link, useLocation } from "react-router-dom"
import { icons, logos } from "@argent/ui"
import { Option } from "../../components/Options"
import { routes } from "../../routes"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

const { CardIcon } = icons
const { Starknet } = logos

interface FundingOnRampOptionProps {
  allowFiatPurchase: boolean
  isMainnet: boolean
  isBanxaEnabled: boolean
}

export const FundingOnRampOption: FC<FundingOnRampOptionProps> = ({
  allowFiatPurchase,
  isMainnet,
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
            isBanxaEnabled ? "Provided by Ramp and Banxa" : "Provided by Ramp"
          }
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
          icon={<Starknet width={6} height={6} />}
          description="From StarkNet token faucet"
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
