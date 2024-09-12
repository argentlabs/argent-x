import { Box, BoxProps } from "@chakra-ui/react"
import { FC } from "react"

import { DappDisplayAttributes } from "./useDappDisplayAttributes"
import { UnknownDappIcon } from "../transactionV2/header/icon"

interface DappIconProps extends BoxProps {
  dappDisplayAttributes?: DappDisplayAttributes
}

export const DappIcon: FC<DappIconProps> = ({
  dappDisplayAttributes,
  ...rest
}) => {
  return (
    <Box
      borderRadius={16}
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
    >
      {!dappDisplayAttributes?.iconUrl && (
        <UnknownDappIcon
          padding={1}
          width="100%"
          height="100%"
          borderRadius={8}
          boxShadow="menu"
        />
      )}
    </Box>
  )
}
