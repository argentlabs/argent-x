import { debounce } from "lodash-es"
import { FC, useCallback, useEffect, useMemo, useState } from "react"

import {
  isAllowedNumericInputValue,
  prettifyTokenAmount,
} from "@argent/x-shared"
import { TokenValue } from "./TokenValue"
import { SwapTokensModal } from "./SwapTokensModal"
import { Token } from "../../../../shared/token/__new/types/token.model"
import { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import { useDisclosure, Flex, Input, Button } from "@chakra-ui/react"
import {
  H6,
  L2,
  LoadingPulse,
  P4,
  iconsDeprecated,
  TokenIcon,
} from "@argent/x-ui"

const { ChevronDownIcon } = iconsDeprecated

interface SwapInputPanelProps {
  value: string
  type: "pay" | "receive"
  onUserInput: (value: string) => void
  onMax?: () => void
  token?: Token | undefined
  showMaxButton?: boolean
  onTokenSelect?: (token: Token) => void
  currentBalance?: TokenWithOptionalBigIntBalance
  otherToken?: Token | null
  id: string
  tradeLoading: boolean
  insufficientBalance?: boolean
}

const SwapInputPanel: FC<SwapInputPanelProps> = ({
  id,
  value,
  onUserInput,
  type,
  token,
  currentBalance,
  onTokenSelect,
  onMax,
  showMaxButton = false,
  tradeLoading,
  insufficientBalance,
}) => {
  const {
    isOpen: isTokenListOpen,
    onOpen: onOpenTokenList,
    onClose: onCloseTokenList,
  } = useDisclosure()

  const [inputValue, setInputValue] = useState("")

  const onMaxCheck = useCallback(() => {
    onMax?.()
  }, [onMax])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const delayedOnChange = useCallback(
    debounce((nextValue) => {
      onUserInput(nextValue)
    }, 500),
    [onUserInput],
  )

  useEffect(() => {
    return () => {
      delayedOnChange.cancel()
    }
  }, [delayedOnChange])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAllowedNumericInputValue(e.target.value)) {
      setInputValue(e.target.value)
      delayedOnChange(e.target.value)
    }
  }

  const prettyBalance = useMemo(() => {
    const significantDigits = 6

    if (!currentBalance) {
      return "0"
    }

    const { balance, decimals } = currentBalance

    return prettifyTokenAmount({
      amount: balance ?? 0n,
      decimals,
      prettyConfigOverrides: {
        minDecimalSignificantDigits: significantDigits,
      },
    })
  }, [currentBalance])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  return (
    <>
      <Flex
        position="relative"
        flexDirection="column"
        gap="2px"
        padding="16px 20px"
        backgroundColor="neutrals.800"
        width="100%"
        borderRadius={type === "pay" ? "12px 12px 0 0" : "0 0 12px 12px"}
        id={id}
      >
        <Flex>
          <P4 color="neutrals.400">{type === "pay" ? "Pay" : "Receive"}</P4>
        </Flex>

        <Flex justifyContent="space-between" alignItems="center">
          <LoadingPulse isLoading={tradeLoading && !value} mr="3">
            <Input
              color={insufficientBalance ? "error.500" : "white"}
              p="0"
              minH="min-content"
              variant="flat"
              placeholder="0"
              fontSize="24px"
              fontWeight="600"
              lineHeight="26px"
              value={inputValue}
              onChange={onChange}
              data-testid={id}
              isDisabled={type === "receive"}
              _disabled={{ opacity: 1, cursor: "default" }}
            />
          </LoadingPulse>

          {token && (
            <Flex alignItems="center">
              <Button
                height="min-content"
                minH="min-content"
                width="min-content"
                backgroundColor="neutrals.900"
                rounded={"full"}
                onClick={onOpenTokenList}
                leftIcon={
                  <TokenIcon
                    name={token?.name || "?"}
                    url={token?.iconUrl}
                    size="5"
                  />
                }
                px="1"
                py="1"
                rightIcon={<ChevronDownIcon />}
              >
                <H6>{token?.symbol}</H6>
              </Button>
            </Flex>
          )}
        </Flex>

        <Flex justifyContent="space-between">
          <Flex flexDirection="column">
            {showMaxButton && (
              <L2
                onClick={onMaxCheck}
                fontWeight="500"
                color="primary.500"
                cursor="pointer"
              >
                Max
              </L2>
            )}
            {value && token && (
              <TokenValue
                amount={value}
                token={token}
                approx={type === "receive"}
              />
            )}
          </Flex>
          <L2 fontWeight="500" color="neutrals.400">
            {`Balance: ${prettyBalance}`}
          </L2>
        </Flex>
      </Flex>

      <SwapTokensModal
        isOpen={isTokenListOpen}
        onClose={onCloseTokenList}
        isPay={type === "pay"}
        onTokenSelect={onTokenSelect}
      />
    </>
  )
}

export { SwapInputPanel }
