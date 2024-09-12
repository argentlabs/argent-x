import { AlertButton, P4, iconsDeprecated } from "@argent/x-ui"
import { Box, Spinner } from "@chakra-ui/react"
import { FC } from "react"
import { To, useNavigate } from "react-router-dom"

const { UpgradeIcon } = iconsDeprecated

export interface BannerRouteState {
  from?: string
}

export interface UpgradeBannerProps {
  to?: To
  state?: BannerRouteState
  onClick?: () => void
  canNotPay?: boolean
  loading?: boolean
  learnMoreLink?: string
  onClose?: () => void
}

export const UpgradeBanner: FC<UpgradeBannerProps> = ({
  to,
  state,
  onClick,
  loading,
  learnMoreLink,
  onClose,
}) => {
  const navigate = useNavigate()

  const onLearnMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(learnMoreLink, "_blank")?.focus()
  }

  const description = (
    <Box mt="0.5">
      <P4 color="white.50">Upgrade to use the latest features</P4>
      <P4
        textDecoration="underline"
        color="white.50"
        cursor="pointer"
        onClick={onLearnMoreClick}
        w="fit-content"
      >
        Learn more
      </P4>
    </Box>
  )

  return (
    <AlertButton
      colorScheme="accent"
      bg="surface-info-default"
      title="Upgrade available"
      description={description}
      size="lg"
      icon={loading ? <Spinner /> : <UpgradeIcon h={5} w={5} />}
      onClick={() => {
        onClick?.()
        to && navigate(to, { state })
      }}
      onClose={onClose}
      sx={{
        "& .chakra-alert__icon": {
          bg: "surface-info-vibrant",
        },
      }}
    />
  )
}
