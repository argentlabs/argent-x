import { AlertButton, iconsDeprecated } from "@argent/x-ui"
import { FC } from "react"
import { LinkProps, useNavigate } from "react-router-dom"

const { AlertIcon } = iconsDeprecated

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
