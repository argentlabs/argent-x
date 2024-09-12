import { formatAddress } from "@argent/x-shared"
import { B3, L2, NavigationBarHeight } from "@argent/x-ui"
import { Flex, FlexProps, Text, TextProps } from "@chakra-ui/react"
import { FC } from "react"

export interface LedgerStatusTextProps extends TextProps {
  isConnected?: boolean
}

export const LedgerStatusText: FC<LedgerStatusTextProps> = ({
  isConnected,
  ...rest
}) => {
  if (isConnected) {
    return (
      <Text color="text-success" {...rest}>
        {"\u23FA"} Ledger connected
      </Text>
    )
  }
  return (
    <Text color="text-secondary" {...rest}>
      {"\u23FA"} Ledger not connected
    </Text>
  )
}

export interface NavigationBarAccountDetailsProps extends FlexProps {
  accountAddress?: string
  accountName?: string
  networkName?: string
  isLedgerConnected?: boolean
}

export const NavigationBarAccountDetails: FC<
  NavigationBarAccountDetailsProps
> = ({
  accountAddress,
  accountName,
  networkName,
  isLedgerConnected,
  ...rest
}) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      px={4}
      gap={2}
      minHeight={NavigationBarHeight}
      {...rest}
    >
      <Flex direction="column" gap={0.5}>
        <Flex gap={1.5} alignItems={"baseline"}>
          <B3
            color="text-primary"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow={"ellipsis"}
          >
            {accountName}
          </B3>
          {accountAddress && (
            <L2 color="text-secondary">({formatAddress(accountAddress)})</L2>
          )}
        </Flex>
        {isLedgerConnected && (
          <LedgerStatusText as={L2} isConnected={isLedgerConnected} />
        )}
      </Flex>
      {networkName && (
        <Flex>
          <B3
            color="text-primary"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow={"ellipsis"}
          >
            {networkName}
          </B3>
        </Flex>
      )}
    </Flex>
  )
}
