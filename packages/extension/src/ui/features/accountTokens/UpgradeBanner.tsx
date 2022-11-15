import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { To, useNavigate } from "react-router-dom"

const { UpgradeIcon } = icons

export interface UpgradeBannerProps {
  to?: To
  state?: any
  canNotPay?: boolean
}

export const UpgradeBanner: FC<UpgradeBannerProps> = ({
  to,
  state,
  canNotPay,
}) => {
  const navigate = useNavigate()
  return (
    <AlertButton
      colorScheme={"primary"}
      title="Upgrade Required"
      description={
        canNotPay
          ? "Add ETH to upgrade and use this account"
          : "Upgrade to continue using this account"
      }
      size="lg"
      icon={<UpgradeIcon />}
      onClick={() => {
        to && navigate(to, { state })
      }}
    />
  )
}
