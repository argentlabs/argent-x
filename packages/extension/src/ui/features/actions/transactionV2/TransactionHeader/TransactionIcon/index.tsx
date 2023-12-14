import { FC } from "react"

import { UnknownDappIcon } from "./UnknownDappIcon"
import { DappIcon } from "./DappIcon"

import { AllIconKeys } from "../../../../../../shared/actionQueue/schema"
import { KnownIcon } from "./KnownIcon"
import { BoxProps } from "@chakra-ui/react"

export interface TransactionIconProps extends BoxProps {
  dappLogoUrl?: string
  iconKey?: AllIconKeys
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
