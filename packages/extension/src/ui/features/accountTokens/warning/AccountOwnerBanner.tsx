import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { LinkProps, useNavigate } from "react-router-dom"

const { AlertIcon } = icons

export interface AccountOwnerBannerProps extends LinkProps {}

export const AccountOwnerBanner: FC<AccountOwnerBannerProps> = ({ to }) => {
  const navigate = useNavigate()
  return (
    <AlertButton
      colorScheme="warn-high"
      title="Can’t access account"
      description="Click to learn more"
      size="lg"
      icon={<AlertIcon />}
      bg="primaryExtraDark.500"
      onClick={() => navigate(to)}
    />
  )
}
