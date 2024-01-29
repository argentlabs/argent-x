import { Box } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { ButtonCell } from "./CellStack"
import { CloseIcon } from "./icons"
import { P3, P4 } from "./Typography"

interface CloseButtonProps {
  onClick?: MouseEventHandler<HTMLDivElement>
}

interface ThemedBanner {
  dark?: boolean
}

interface BannerProps {
  href?: string
  backgroundImageUrl: string
  title?: string
  subTitle?: string
  onClose?: () => void
  onClick?: () => void
}

const Scrim: FC<ThemedBanner> = ({ dark }) => (
  <Box
    position="absolute"
    top="0"
    left="0"
    right="0"
    bottom="0"
    background={
      dark
        ? `linear-gradient(180deg, rgba(0, 0, 0, 0.50) 0%, rgba(255, 255, 255, 0.00) 20%)`
        : `linear-gradient(180deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.00) 100%)`
    }
  />
)
const CloseButton: FC<CloseButtonProps & ThemedBanner> = ({
  dark,
  ...props
}) => (
  <Box
    position="absolute"
    top="0"
    right="0"
    width="24px"
    height="24px"
    zIndex="1"
    background={dark ? "white" : "black"}
    color={dark ? "black" : "white"}
    borderRadius={"50%"}
    m={1}
    display="flex"
    justifyContent="center"
    alignItems="center"
    {...props}
  >
    <CloseIcon fontSize="xs" data-testid="close-banner" />
  </Box>
)

export const Banner: FC<BannerProps & ThemedBanner> = ({
  href,
  backgroundImageUrl,
  title = "Discover",
  subTitle = "Starknet dapps",
  onClose,
  dark,
  onClick,
}) => {
  return (
    <ButtonCell
      width="100%"
      overflow="hidden"
      position={"relative"}
      rightIcon={null}
      bgColor="#FFFFFF"
      background={`url("${backgroundImageUrl}")`}
      backgroundSize="cover"
      backgroundPosition="right top"
      backgroundRepeat="no-repeat"
      as="a"
      title={title}
      target="_blank"
      // reset hover styles
      _hover={{
        background: `url("${backgroundImageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "right top",
        backgroundRepeat: "no-repeat",
        backgroundColor: "white",
      }}
      href={href}
      onClick={onClick}
    >
      <Scrim dark={dark} />
      <P3 zIndex="1" color={dark ? "white" : "black"} fontWeight="extrabold">
        {title}
      </P3>
      <P4 zIndex="1" color={dark ? "white" : "black"} fontWeight="medium">
        {subTitle}
      </P4>
      <CloseButton
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClose?.()
        }}
        dark={dark}
      />
    </ButtonCell>
  )
}
