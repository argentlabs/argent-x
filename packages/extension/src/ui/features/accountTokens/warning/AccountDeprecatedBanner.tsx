import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { To, useNavigate } from "react-router-dom"
import { BannerRouteState } from "../UpgradeBanner"

const { AlertIcon } = icons

export interface UpgradeBannerProps {
  to: To
  state?: BannerRouteState
}

export const AccountDeprecatedBanner: FC<UpgradeBannerProps> = ({
  to,
  state,
}) => {
  const navigate = useNavigate()
  return (
    <AlertButton
      colorScheme="warn-high"
      title="Account deprecated"
      description="Click to learn more"
      size="lg"
      icon={<AlertIcon />}
      bg="primaryExtraDark.500"
      onClick={() => {
        navigate(to, { state })
      }}
    />
  )
}
