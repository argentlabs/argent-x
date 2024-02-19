import { Box, BoxProps } from "@chakra-ui/react"
import { FC } from "react"

import { DappDisplayAttributes } from "./useDappDisplayAttributes"
import { UnknownDappIcon } from "../transactionV2/TransactionHeader/TransactionIcon/UnknownDappIcon"

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
        <UnknownDappIcon borderRadius={16} padding={1} />
      )}
    </Box>
  )
}
