import { Image } from "@chakra-ui/react"

import { IconWrapper } from "./IconWrapper"

export const VerifiedDappIcon = ({ iconUrl }: { iconUrl: string }) => (
  <IconWrapper>
    <Image src={iconUrl} borderRadius="2xl" />
  </IconWrapper>
)
