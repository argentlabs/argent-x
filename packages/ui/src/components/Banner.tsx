import { Box, BoxProps } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { ButtonCell } from "./CellStack"
import { CloseIcon } from "./icons"
import { P3, P4 } from "./Typography"

interface CloseButtonProps {
  onClick?: MouseEventHandler<HTMLDivElement>
  dark?: boolean
}

interface BannerProps extends BoxProps {
  href?: string
  backgroundImageUrl?: string
  title?: string
  subTitle?: string
  onClose?: () => void
  onClick?: () => void
  dark?: boolean
}

const Scrim: FC<BannerProps> = ({ dark, ...rest }) => (
  <Box position="absolute" top="0" left="0" right="0" bottom="0" {...rest} />
)
const CloseButton: FC<CloseButtonProps> = ({ dark, ...props }) => (
  <Box
    position="absolute"
    top="0"
    right="0"
    width="24px"
    height="24px"
    zIndex="1"
    background={"black"}
    color={"white"}
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

export const Banner: FC<BannerProps> = ({
  href,
  backgroundImageUrl,
  title = "Discover",
  subTitle = "Starknet dapps",
  onClose,
  dark,
  onClick,
  ...rest
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
      whiteSpace="initial"
      {...rest}
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
