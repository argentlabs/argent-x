import { BoxProps, Image } from "@chakra-ui/react"
import { UnknownDappIcon } from "./UnknownDappIcon"

export const DappIcon = ({
  iconUrl,
  ...rest
}: BoxProps & { iconUrl: string }) => (
  <Image
    src={iconUrl}
    fallback={<UnknownDappIcon {...rest} />}
    borderRadius="2xl"
    {...rest}
  />
)
