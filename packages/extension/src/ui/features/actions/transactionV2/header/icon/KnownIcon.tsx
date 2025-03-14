import type { BoxProps } from "@chakra-ui/react"
import { IconWrapper } from "./IconWrapper"
import { transactionIcons } from "../../../transaction/getTransactionIcon"
import type { TransactionIconKeys } from "../../../../../../shared/actionQueue/schema"

export const KnownIcon = ({
  iconKey,
  ...rest
}: BoxProps & { iconKey: TransactionIconKeys }) => {
  const IconComponent = transactionIcons[iconKey]
  return (
    <IconWrapper rounded="2xl" {...rest}>
      <IconComponent fontSize={"xl"} color="neutrals.900" />
    </IconWrapper>
  )
}
