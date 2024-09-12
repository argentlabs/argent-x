import { FC } from "react"
import { UnknownDappIcon } from "./UnknownDappIcon"
import { DappIcon } from "./DappIcon"
import { KnownIcon } from "./KnownIcon"
import { BoxProps, Skeleton } from "@chakra-ui/react"
import { IconDeprecatedKeys } from "@argent/x-ui"

export interface TransactionIconProps extends BoxProps {
  dappLogoUrl?: string
  iconKey?: IconDeprecatedKeys
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
    <KnownIcon iconKey={iconKey} {...rest} />
  ) : (
    <UnknownDappIcon {...rest} />
  )
}
