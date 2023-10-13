import { Box } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { ButtonCell } from "./CellStack"
import { CloseIcon } from "./icons"
import { P3, P4 } from "./Typography"

interface CloseButtonProps {
  onClick?: MouseEventHandler<HTMLDivElement>
}

interface DapplandBannerProps {
  href: string
  backgroundImageUrl: string
  title?: string
  subTitle?: string
  onClose?: () => void
}

const Scrim: FC = () => (
  <Box
    position="absolute"
    top="0"
    left="0"
    right="0"
    bottom="0"
    background="linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%)"
    zIndex="0"
  />
)
const CloseButton: FC<CloseButtonProps> = ({ ...props }) => (
  <Box
    position="absolute"
    top="0"
    right="0"
    width="24px"
    height="24px"
    zIndex="1"
    background="black"
    color="white"
    borderRadius={"50%"}
    m={1}
    display="flex"
    justifyContent="center"
    alignItems="center"
    {...props}
  >
    <CloseIcon fontSize="xs" data-testid="close-dappland-banner" />
  </Box>
)

export const DapplandBanner: FC<DapplandBannerProps> = ({
  href,
  backgroundImageUrl,
  title = "Discover",
  subTitle = "Starknet dapps",
  onClose,
}) => {
  return (
    <ButtonCell
      width="100%"
      overflow="hidden"
      position={"relative"}
      rightIcon={null}
      bgColor="#DCCAC0"
      background={`url("${backgroundImageUrl}")`}
      backgroundSize="contain"
      backgroundPosition="right top"
      backgroundRepeat="no-repeat"
      as="a"
      title="Dappland"
      target="_blank"
      // reset hover styles
      _hover={{
        background: `url("${backgroundImageUrl}")`,
        backgroundSize: "contain",
        backgroundPosition: "right top",
        backgroundRepeat: "no-repeat",
        bgColor: "#DCCAC0",
      }}
      href={href}
    >
      <Scrim />
      <P3 zIndex="1" color="black" fontWeight="extrabold">
        {title}
      </P3>
      <P4 zIndex="1" color="black" fontWeight="medium">
        {subTitle}
      </P4>
      <CloseButton
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClose?.()
        }}
      />
    </ButtonCell>
  )
}
