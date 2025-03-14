import type { FC } from "react"
import { UnknownDappIcon } from "./UnknownDappIcon"
import { DappIcon } from "./DappIcon"
import { KnownIcon } from "./KnownIcon"
import type { BoxProps } from "@chakra-ui/react"
import type { TransactionIconKeys } from "../../../../../../shared/actionQueue/schema"

export interface TransactionIconProps extends BoxProps {
  dappLogoUrl?: string
  iconKey?: TransactionIconKeys
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  dappLogoUrl,
  iconKey,
  ...rest
}) => {
  if (dappLogoUrl) {
    return <DappIcon iconUrl={dappLogoUrl} {...rest} />
  }

  return iconKey ? (
    <KnownIcon iconKey={iconKey} {...rest} borderRadius={"full"} />
  ) : (
    <UnknownDappIcon {...rest} borderRadius={"full"} />
  )
}
