import { AlertButton, icons } from "@argent/x-ui"
import { Spinner } from "@chakra-ui/react"
import { FC } from "react"
import { To, useNavigate } from "react-router-dom"

const { UpgradeIcon } = icons

export interface BannerRouteState {
  from?: string
}

export interface UpgradeBannerProps {
  to?: To
  state?: BannerRouteState
  onClick?: () => void
  canNotPay?: boolean
  loading?: boolean
}

export const UpgradeBanner: FC<UpgradeBannerProps> = ({
  to,
  state,
  canNotPay,
  onClick,
  loading,
}) => {
  const navigate = useNavigate()

  return (
    <AlertButton
      colorScheme="primary"
      bg="primaryExtraDark.500"
      title="Upgrade to Cairo 1 available"
      description={
        canNotPay
          ? "Add ETH to upgrade this account"
          : "Upgrade to the next phase of Starknet"
      }
      size="lg"
      icon={loading ? <Spinner /> : <UpgradeIcon />}
      onClick={() => {
        onClick?.()
        to && navigate(to, { state })
      }}
    />
  )
}
