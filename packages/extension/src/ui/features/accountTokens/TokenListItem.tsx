import { H5, L2Bold, P3, P4, TokenIcon } from "@argent/x-ui"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import type { FC } from "react"

import type { CustomButtonCellProps } from "../../components/CustomButtonCell"
import { CustomButtonCell } from "../../components/CustomButtonCell"

export type TokenListItemVariant = "default" | "no-currency"

export interface TokenListItemProps extends CustomButtonCellProps {
  name: string
  iconUrl?: string
  symbol: string
  balance?: string | null
  variant?: TokenListItemVariant
  currencyValue?: string | null
  showTokenSymbol?: boolean
  ref?: React.Ref<HTMLDivElement>
  errorText?: string
}

export const TokenListItem: FC<TokenListItemProps> = ({
  name,
  iconUrl,
  symbol,
  balance,
  variant,
  showTokenSymbol = false,
  currencyValue,
  errorText,
  ...rest
}) => {
  const isNoCurrencyVariant = variant === "no-currency"
  return (
    <CustomButtonCell w="full" {...rest}>
      <TokenIcon size={10} url={iconUrl} name={name} />
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={4}
        overflow={"hidden"}
      >
        <Tooltip label={name} openDelay={1500} placement="top">
          <Flex direction="column" gap={0.5} overflow="hidden">
            <H5
              overflow="hidden"
              textOverflow={"ellipsis"}
              data-testid={symbol}
            >
              {name}
            </H5>
            {errorText && <P4 color="error.400">{errorText}</P4>}
          </Flex>
        </Tooltip>
        <Flex
          direction="column"
          overflow="hidden"
          flex="0 0 auto"
          alignItems="flex-end"
          gap={0.5}
        >
          <Text data-value={balance}>
            <H5>{isNoCurrencyVariant ? balance : currencyValue}</H5>
          </Text>
          {!isNoCurrencyVariant && (
            <L2Bold
              color="text-secondary"
              overflow="hidden"
              textOverflow="ellipsis"
              data-testid={`${symbol}-balance`}
            >
              {balance}
            </L2Bold>
          )}
          {showTokenSymbol && (
            <P3 color="text-secondary" fontWeight="semibold">
              {symbol}
            </P3>
          )}
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
