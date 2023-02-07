import { Button, FieldError, H6, P4, icons } from "@argent/ui"
import { Flex, Skeleton, Tooltip } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../shared/token/price"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { LoadingPulse } from "../../components/LoadingPulse"
import { TokenIcon } from "./TokenIcon"
import { toTokenView } from "./tokens.service"
import { TokenDetailsWithBalance } from "./tokens.state"

const { AlertIcon } = icons

export type TokenListItemVariant = "default" | "no-currency"

export interface TokenListItemProps extends ComponentProps<typeof Button> {
  token: TokenDetailsWithBalance
  variant?: TokenListItemVariant
  isLoading?: boolean
  currencyValue: string | undefined
  showTokenSymbol?: boolean
  errorMessage?: {
    message: string
    description: string
  }
}

export const TokenListItem: FC<TokenListItemProps> = ({
  token,
  variant,
  isLoading = false,
  showTokenSymbol = false,
  currencyValue,
  errorMessage,
  ...rest
}) => {
  const { name, image, symbol } = toTokenView(token)
  const displayBalance = prettifyTokenBalance(token)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)
  const isNoCurrencyVariant = variant === "no-currency"
  if (token.balance === undefined && !errorMessage) {
    return <Skeleton height={17} rounded={"xl"} />
  }
  return (
    <CustomButtonCell {...rest}>
      <TokenIcon size={9} url={image} name={name} />
      <Flex
        flexGrow={1}
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        overflow={"hidden"}
      >
        <Flex direction={"column"} overflow="hidden">
          <H6 overflow="hidden" textOverflow={"ellipsis"}>
            {name === "Ether" ? "Ethereum" : name}
          </H6>
          {!isNoCurrencyVariant && (
            <LoadingPulse isLoading={isLoading}>
              <P4
                color="neutrals.300"
                fontWeight={"semibold"}
                overflow="hidden"
                textOverflow={"ellipsis"}
              >
                {displayBalance}
              </P4>
            </LoadingPulse>
          )}
          {showTokenSymbol && (
            <P4 color="neutrals.400" fontWeight={"semibold"}>
              {symbol}
            </P4>
          )}
        </Flex>
        <Flex direction={"column"} overflow="hidden">
          <LoadingPulse isLoading={isLoading}>
            {errorMessage ? (
              <Tooltip label={errorMessage.description}>
                <FieldError
                  overflow="hidden"
                  textOverflow={"ellipsis"}
                  display="flex"
                  gap="1"
                >
                  <AlertIcon />
                  {errorMessage.message}
                </FieldError>
              </Tooltip>
            ) : (
              <H6 overflow="hidden" textOverflow={"ellipsis"}>
                {isNoCurrencyVariant ? displayBalance : displayCurrencyValue}
              </H6>
            )}
          </LoadingPulse>
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
