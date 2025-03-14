import {
  bigDecimal,
  isAllowedNumericInputValue,
  prettifyTokenAmount,
} from "@argent/x-shared"
import { CompoundInput } from "@argent/x-ui"
import { Flex, useDisclosure } from "@chakra-ui/react"
import { debounce } from "lodash-es"
import type { FC } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { PriceImpactResult } from "../../../../shared/swap/model/trade.model"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import type { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import {
  useCurrencyValueToTokenAmount,
  useTokenAmountToCurrencyFormatted,
} from "../../accountTokens/tokenPriceHooks"
import { SwapTokensModal } from "./SwapTokensModal"

interface SwapInputProps {
  id: string
  type: "pay" | "receive"
  value: string
  onChange: (value: string) => void
  isReadOnly?: boolean
  isFiatInput?: boolean
  setIsFiatInput?: (value: boolean) => void
  onPercentageClick?: (percentage: number) => void
  onTokenSelect: (token: Token) => void
  isLoading: boolean
  tokenWithBalance?: TokenWithOptionalBigIntBalance
  insufficientBalance?: boolean
  priceImpact?: PriceImpactResult
}

const SwapInputPanel: FC<SwapInputProps> = ({
  id,
  type,
  value,
  onChange,
  onPercentageClick,
  onTokenSelect,
  isLoading,
  isFiatInput = false,
  setIsFiatInput,
  tokenWithBalance,
  insufficientBalance,
  priceImpact,
}) => {
  const [inputValue, setInputValue] = useState<string | undefined>()

  const prettyBalance = useMemo(() => {
    const significantDigits = 6

    if (!tokenWithBalance) {
      return "0"
    }

    const { balance, decimals } = tokenWithBalance

    const prettyBalance = prettifyTokenAmount({
      amount: balance ?? 0n,
      decimals,
      prettyConfigOverrides: {
        minDecimalSignificantDigits: significantDigits,
      },
    })

    return prettyBalance ?? "0"
  }, [tokenWithBalance])

  const {
    isOpen: isTokenListOpen,
    onOpen: onOpenTokenList,
    onClose: onCloseTokenList,
  } = useDisclosure()

  const tokenAmount = useCurrencyValueToTokenAmount(
    inputValue,
    tokenWithBalance,
  )

  const currencyValue = useTokenAmountToCurrencyFormatted(
    bigDecimal.parseUnits(inputValue ?? "0", tokenWithBalance?.decimals).value,
    tokenWithBalance,
  )

  const convertedAmount = isFiatInput ? tokenAmount : currencyValue

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delayedOnChange = useCallback(
    debounce((nextValue) => {
      onChange(nextValue)
    }, 500),
    [onChange],
  )

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    return () => {
      delayedOnChange.cancel()
    }
  }, [delayedOnChange])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (isAllowedNumericInputValue(value, tokenWithBalance?.decimals)) {
      setInputValue(value)
      delayedOnChange(value)
    }
  }

  const handleFiatAmountSwitch = () => {
    setIsFiatInput?.(!isFiatInput)
    // not using handleOnChange because we don't need the debounce
    if (
      convertedAmount &&
      isAllowedNumericInputValue(convertedAmount, tokenWithBalance?.decimals)
    ) {
      setInputValue(convertedAmount)
      onChange(convertedAmount)
    }
  }

  const isPayInput = type === "pay"
  const fiatSymbol = "$"

  return (
    <>
      {tokenWithBalance && (
        <CompoundInput
          amount={{
            value: inputValue,
            onChange: handleOnChange,
            onPercentageClick: onPercentageClick,
            hasError: insufficientBalance,
            isFiatInput: isFiatInput,
            fiatSymbol: fiatSymbol,
            onSwitchClick: isPayInput ? handleFiatAmountSwitch : undefined,
            conversionValue: {
              value: convertedAmount,
              approx: !isPayInput,
              symbol: isFiatInput ? tokenWithBalance.symbol : fiatSymbol,
            },
            priceImpact: priceImpact,
          }}
          token={{
            selected: {
              name: tokenWithBalance.name,
              iconUrl: tokenWithBalance.iconUrl ?? "",
              symbol: tokenWithBalance.symbol,
              balance: prettyBalance,
              onBalanceClick: isPayInput
                ? () => onPercentageClick?.(100)
                : undefined,
            },
            onClick: onOpenTokenList,
          }}
          isLoading={isLoading}
        >
          <CompoundInput.Container>
            <Flex flexDirection="column" gap="2">
              <Flex justifyContent="space-between" alignItems="center">
                <CompoundInput.InputToken>
                  Select token
                </CompoundInput.InputToken>
                <CompoundInput.InputAmount id={id} />
              </Flex>
              <Flex gap="3">
                <CompoundInput.TokenBalance />
                <CompoundInput.PercentageButton percentage={50} />
                <CompoundInput.PercentageButton percentage={100} />
                <Flex gap="2" marginLeft="auto" alignItems="center">
                  <CompoundInput.SwitchButton />
                  <CompoundInput.ConversionValue />
                  <CompoundInput.PriceImpact priceImpact={priceImpact} />
                </Flex>
              </Flex>
            </Flex>
          </CompoundInput.Container>
        </CompoundInput>
      )}
      <SwapTokensModal
        isOpen={isTokenListOpen}
        onClose={onCloseTokenList}
        isPay={isPayInput}
        onTokenSelect={onTokenSelect}
      />
    </>
  )
}

export { SwapInputPanel }
