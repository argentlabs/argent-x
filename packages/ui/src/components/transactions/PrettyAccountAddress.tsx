import {
  formatTruncatedAddress,
  getNetworkAccountImageUrl,
} from "@argent/shared"
import { Flex } from "@chakra-ui/react"
import { ComponentProps, FC, ReactNode } from "react"

import { TokenIcon } from "../TokenIcon"
import { P4 } from "../Typography"

interface PrettyAccountAddressProps
  extends Pick<ComponentProps<typeof TokenIcon>, "size"> {
  accountAddress: string
  networkId: string
  accountName?: string
  fallbackValue?: (accountAddress: string) => ReactNode
  icon?: boolean
  bold?: boolean
}

export const PrettyAccountAddress: FC<PrettyAccountAddressProps> = ({
  accountAddress,
  networkId,
  accountName,
  size = 10,
  fallbackValue,
  icon = true,
  bold = false,
}) => {
  const accountImageUrl = getNetworkAccountImageUrl({
    accountName: accountName || accountAddress,
    networkId,
    accountAddress,
  })

  const accountDisplayName = accountName
    ? accountName
    : fallbackValue
    ? fallbackValue(accountAddress)
    : formatTruncatedAddress(accountAddress)

  if (accountDisplayName && !icon) {
    return <>{accountDisplayName}</>
  }
  return (
    <Flex alignItems={"center"} gap={2}>
      {icon && accountName && (
        <TokenIcon url={accountImageUrl} name={accountAddress} size={size} />
      )}
      {bold ? (
        <P4 fontWeight="bold">{accountDisplayName}</P4>
      ) : (
        accountDisplayName
      )}
    </Flex>
  )
}
