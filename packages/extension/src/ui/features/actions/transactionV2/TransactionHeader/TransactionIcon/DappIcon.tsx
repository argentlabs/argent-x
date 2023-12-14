import { BoxProps, Image } from "@chakra-ui/react"

export const DappIcon = ({
  iconUrl,
  ...rest
}: BoxProps & { iconUrl: string }) => (
  <Image src={iconUrl} borderRadius="2xl" {...rest} />
)
