import {
  FieldError,
  H6,
  LoadingPulse,
  P4,
  TextWithAmount,
  icons,
} from "@argent/ui"
import { ButtonProps, Flex, Skeleton, Tooltip } from "@chakra-ui/react"
import { FC } from "react"

import {
  prettifyCurrencyValue,
  prettifyTokenBalance,
} from "../../../shared/token/price"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { tokenService } from "../../services/tokens"
import { TokenIcon } from "./TokenIcon"
import { TokenWithOptionalBigIntBalance } from "../../../shared/token/__new/types/tokenBalance.model"

const { AlertIcon } = icons

export type TokenListItemVariant = "default" | "no-currency"

export interface TokenListItemProps extends ButtonProps {
  token: TokenWithOptionalBigIntBalance
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
  const { name, iconUrl, symbol } = tokenService.toTokenView(token)
  const displayBalance = prettifyTokenBalance(token)
  const displayCurrencyValue = prettifyCurrencyValue(currencyValue)
  const isNoCurrencyVariant = variant === "no-currency"
  const tokenName = name === "Ether" ? "Ethereum" : name

  if (token.balance === undefined && !errorMessage) {
    return <Skeleton height={17} rounded={"xl"} />
  }

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
          <Flex direction={"column"} overflow="hidden">
            <H6 overflow="hidden" textOverflow={"ellipsis"}>
              {tokenName}
            </H6>
            {!isNoCurrencyVariant && (
              <LoadingPulse isLoading={isLoading}>
                <P4
                  color="neutrals.300"
                  fontWeight={"semibold"}
                  overflow="hidden"
                  textOverflow={"ellipsis"}
                  data-testid={`${token.symbol}-balance`}
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
        </Tooltip>
        <Flex direction={"column"} overflow="hidden" flex="0 0 auto">
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
              <TextWithAmount
                amount={token.balance?.toString() ?? 0}
                decimals={token.decimals}
              >
                <H6>
                  {isNoCurrencyVariant ? displayBalance : displayCurrencyValue}
                </H6>
              </TextWithAmount>
            )}
          </LoadingPulse>
        </Flex>
      </Flex>
    </CustomButtonCell>
  )
}
