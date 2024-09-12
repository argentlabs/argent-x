import { H6, P4, TextWithAmount, TokenIcon } from "@argent/x-ui"
import { ButtonProps, Flex, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

import { prettifyTokenBalance } from "../../../shared/token/prettifyTokenBalance"
import { prettifyCurrencyValue } from "@argent/x-shared"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { TokenWithBalanceAndPrice } from "../../../shared/token/__new/types/tokenPrice.model"

export type TokenListItemVariant = "default" | "no-currency"

export interface TokenListItemProps extends ButtonProps {
  token: TokenWithBalanceAndPrice
  variant?: TokenListItemVariant
  currencyValue: string | undefined
  showTokenSymbol?: boolean
}

export const TokenListItem: FC<TokenListItemProps> = ({
  token,
  variant,
  showTokenSymbol = false,
  currencyValue,
  ...rest
}) => {
  const { name, iconUrl, symbol } = token
  const displayBalance = prettifyTokenBalance(token)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue, undefined, {
    allowLeadingZerosInDecimalPart: false,
  })
  const isNoCurrencyVariant = variant === "no-currency"
  const tokenName = name === "Ether" ? "Ethereum" : name

  return (
    <CustomButtonCell w="full" {...rest}>
      <TokenIcon size={9} url={iconUrl} name={name} />
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={4}
        overflow={"hidden"}
      >
        <Tooltip label={tokenName} openDelay={1500} placement="top">
          <Flex direction="column" gap={0.5} overflow="hidden">
            <H6 overflow="hidden" textOverflow={"ellipsis"}>
              {tokenName}
            </H6>
            {!isNoCurrencyVariant && (
              <P4
                color="text-secondary"
                fontWeight="semibold"
                overflow="hidden"
                textOverflow="ellipsis"
                data-testid={`${token.symbol}-balance`}
              >
                {displayBalance}
              </P4>
            )}
            {showTokenSymbol && (
              <P4 color="text-secondary" fontWeight="semibold">
                {symbol}
              </P4>
            )}
          </Flex>
        </Tooltip>
        <Flex direction={"column"} overflow="hidden" flex="0 0 auto">
          <TextWithAmount
            amount={token.balance?.toString() ?? 0}
            decimals={token.decimals}
          >
            <H6>
              {isNoCurrencyVariant ? displayBalance : displayCurrencyValue}
            </H6>
          </TextWithAmount>
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
