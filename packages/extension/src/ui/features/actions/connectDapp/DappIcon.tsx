import { Box, BoxProps } from "@chakra-ui/react"
import { FC } from "react"

import { DappDisplayAttributes } from "./useDappDisplayAttributes"

interface DappIconProps extends BoxProps {
  dappDisplayAttributes?: DappDisplayAttributes
}

export const DappIcon: FC<DappIconProps> = ({
  dappDisplayAttributes,
  ...rest
}) => {
  return (
    <Box
      borderRadius="xl"
      size="full"
      backgroundSize="cover"
      h="14"
      w="14"
      backgroundImage={
        dappDisplayAttributes?.iconUrl
          ? `url(${dappDisplayAttributes.iconUrl})`
          : "none"
      }
      backgroundColor={
        dappDisplayAttributes?.iconUrl ? "white" : "rgba(255, 255, 255, 0.15)"
      }
      {...rest}
    />
  )
}
