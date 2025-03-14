import { Button, CellStack, L2Bold } from "@argent/x-ui"
import { ArrowDownPrimaryIcon } from "@argent/x-ui/icons"
import {
  Box,
  chakra,
  Flex,
  IconButton,
  keyframes,
  useDisclosure,
} from "@chakra-ui/react"
import { useCallback, useEffect, useMemo, useState } from "react"

import type { Address } from "@argent/x-shared"
import { bigDecimal, ensureDecimals } from "@argent/x-shared"
import type { Token } from "../../../shared/token/__new/types/token.model"
import { delay } from "../../../shared/utils/delay"
import { usePriceImpact } from "./hooks/usePriceImpact"
import { useSwapActionHandlers } from "./hooks/useSwapActionHandler"
import { useSwapCallback } from "./hooks/useSwapCallback"
import { SwapInputError, useSwapInfo } from "./hooks/useSwapInfo"
import { useSwapPercentageInput } from "./hooks/useSwapPercentageInput"
import { Field, useSwapState } from "./state/fields"
import { useUserState } from "./state/user"
import { SwapInputPanel } from "./ui/SwapInputPanel"
import { SwapPriceImpact } from "./ui/SwapPriceImpact"
import { SwapPricesInfo } from "./ui/SwapPricesInfo"
import {
  prettifyCurrenvyValueForSwap,
  prettifyTokenAmountValueForSwap,
} from "../accountTokens/tokenPriceHooks"
import { UnverifiedTokenWarningDialog } from "./ui/UnverifiedTokenWarningDialog"
import { isTokenVerified } from "../accountTokens/tokens.state"

const SwapContainer = chakra(CellStack, {
  baseStyle: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    py: "8px",
    gap: "3",
  },
})

const SwitchDirectionButton = chakra(IconButton, {
  isRound: true,
  baseStyle: {
    backgroundColor: "surface-default",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "4px solid",
    borderColor: "surface-default",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "32px",
    maxWidth: "32px",
    minHeight: "32px",
    minWidth: "32px",
    zIndex: 2,
    boxShadow: "none",
    _hover: {
      boxShadow: "none",
    },
    _active: {
      transform: "translate(-50%, -50%)", // make sure the button stays centered
      boxShadow: "none",
    },
  },
})

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const StyledSwitchDirectionIcon = chakra(ArrowDownPrimaryIcon, {
  shouldComponentUpdate: true,
})

const AnimatedSwitchDirectionIcon = ({
  showAnimation,
}: {
  showAnimation: boolean
}) => (
  <StyledSwitchDirectionIcon
    data-testid="switch-direction-icon"
    color="icon-secondary"
    width="100%"
    height="100%"
    padding="4px"
    borderRadius="100%"
    backgroundColor="surface-default"
    _hover={{
      color: "white",
      backgroundColor: "button-secondary",
    }}
    _active={{
      color: "white",
    }}
    animation={showAnimation ? `${fadeIn} 0.3s ease-in forwards` : undefined}
  />
)

export const swapAnimation = keyframes`
  0% {
    transform: translateY(0);
    z-index: 1;
  }
  100% {
    transform: translateY(calc(100% + 4px));
    z-index: 1;
  }
`

export const reverseSwapAnimation = keyframes`
  0% {
    transform: translateY(0);
    z-index: 0;
  }
  100% {
    transform: translateY(calc(-100% - 4px));
    z-index: 0;
  }
`

const Swap = ({ tokenAddress }: { tokenAddress?: Address }) => {
  const {
    tokens,
    tokenBalances,
    trade,
    tradeLoading,
    parsedAmount,
    inputError: swapInputError,
  } = useSwapInfo()
  const {
    independentField,
    typedValue,
    resetTypedValue,
    setDefaultPayToken,
    isFiatInput,
    setIsFiatInput,
  } = useSwapState()
  const { onTokenSelection, onUserInput, onSwitchTokens } =
    useSwapActionHandlers()
  const { userSlippageTolerance } = useUserState()

  const [swapUnavailable, setSwapUnavailable] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [showIconAnimation, setShowIconAnimation] = useState(false) // we set this to true on the first switch. Otherwise it the icon will load with animation when the screen is loaded too

  const {
    isOpen: isUnverifiedTokenWarningModalOpen,
    onClose: onUnverifiedTokenWarningModalClose,
    onOpen: onUnverifiedTokenWarningModalOpen,
  } = useDisclosure()

  const payToken = tokens[Field.PAY]
  const receiveToken = tokens[Field.RECEIVE]

  useEffect(() => {
    if (tokenAddress) {
      setDefaultPayToken(tokenAddress)
    }
  }, [setDefaultPayToken, tokenAddress])

  const parsedAmounts = useMemo(
    () => ({
      [Field.PAY]:
        independentField === Field.PAY
          ? parsedAmount
          : BigInt(trade?.payAmount ?? 0),
      [Field.RECEIVE]:
        independentField === Field.RECEIVE
          ? parsedAmount
          : BigInt(trade?.receiveAmount ?? 0),
    }),
    [independentField, parsedAmount, trade],
  )

  useEffect(() => {
    resetTypedValue()
  }, [resetTypedValue])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.PAY, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.RECEIVE, value)
    },
    [onUserInput],
  )

  const dependentField: Field =
    independentField === Field.PAY ? Field.RECEIVE : Field.PAY

  const formatUnits = useCallback(
    (value: bigint, decimals: number) => {
      const formattedValue = bigDecimal.formatUnits({
        value,
        decimals,
      })
      if (isFiatInput) {
        return prettifyCurrenvyValueForSwap(formattedValue) ?? ""
      } else {
        return prettifyTokenAmountValueForSwap(formattedValue) ?? ""
      }
    },
    [isFiatInput],
  )

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: formatUnits(
        parsedAmounts[dependentField] ?? 0n,
        ensureDecimals(tokens[dependentField]?.decimals),
      ),
    }),
    [
      independentField,
      typedValue,
      dependentField,
      formatUnits,
      parsedAmounts,
      tokens,
    ],
  )

  const payTokenBalance = tokenBalances[Field.PAY]
  const payAmount = parsedAmounts[Field.PAY]

  const hasZeroBalance = !payTokenBalance || payTokenBalance.balance === 0n

  const handleInputSelect = useCallback(
    (payToken: Token) => {
      onTokenSelection(Field.PAY, payToken)
      handleTypeInput("")
    },
    [handleTypeInput, onTokenSelection],
  )

  const computePercentageValue = useSwapPercentageInput(
    payTokenBalance,
    isFiatInput,
  )

  const handlePercentageInput = (percentage: number) => {
    computePercentageValue(percentage)
  }

  const handleOutputSelect = useCallback(
    (receiveToken: Token) => {
      if (!isTokenVerified(receiveToken)) {
        onUnverifiedTokenWarningModalOpen()
      }
      onTokenSelection(Field.RECEIVE, receiveToken)
    },
    [onTokenSelection, onUnverifiedTokenWarningModalOpen],
  )

  const priceImpact = usePriceImpact(trade)

  const noRoute = !trade?.route

  const independentFieldAmount = parsedAmounts[independentField]

  const userHasSpecifiedInputOutput = Boolean(
    payToken &&
      receiveToken &&
      independentFieldAmount &&
      independentFieldAmount > 0n,
  )

  const insufficientLiquidityError =
    !tradeLoading && userHasSpecifiedInputOutput && noRoute

  const isValid =
    !swapInputError && !insufficientLiquidityError && !swapUnavailable

  const canShowSwapQuote =
    (!swapInputError ||
      swapInputError === SwapInputError.INSUFFICIENT_BALANCE) &&
    !insufficientLiquidityError &&
    !swapUnavailable

  const swapCallback = useSwapCallback(trade, userSlippageTolerance)

  const handleSwap = useCallback(async () => {
    if (!swapCallback) {
      return
    }
    try {
      await swapCallback()
      /**
       * wait for store state to propagate into the ui and show the action screen
       * otherwise the user will see a flash of the current screen resetting here
       */
      await delay(0)
      onUserInput(Field.PAY, "")
    } catch {
      setSwapUnavailable(true)
    }
  }, [onUserInput, swapCallback])

  const handleSwitchTokens = useCallback(() => {
    setIsSwapping(true)
    setShowIconAnimation(true)

    setTimeout(() => {
      setIsSwapping(false)
      onSwitchTokens(formattedAmounts[Field.RECEIVE])
    }, 450)
  }, [formattedAmounts, onSwitchTokens])

  return (
    <>
      <SwapContainer data-testid="swap-container">
        <Flex
          position="relative"
          flexDirection="column"
          gap="1"
          borderRadius="lg"
          width={"full"}
          height={"200px"} //we need to set a fixed height to avoid layout shifts when switching tokens
        >
          <Box
            position="relative"
            data-testid="swap-input-pay-panel-box"
            animation={
              isSwapping
                ? `${swapAnimation} 0.5s ease-in-out forwards`
                : undefined
            }
            zIndex={1}
          >
            <SwapInputPanel
              type="pay"
              id="swap-input-pay-panel"
              value={formattedAmounts[Field.PAY]}
              onChange={handleTypeInput}
              onTokenSelect={handleInputSelect}
              onPercentageClick={handlePercentageInput}
              isLoading={tradeLoading}
              tokenWithBalance={payTokenBalance}
              insufficientBalance={!isValid && !!formattedAmounts[Field.PAY]}
              isFiatInput={isFiatInput}
              setIsFiatInput={setIsFiatInput}
            />
          </Box>
          <Box
            position="relative"
            data-testid="swap-input-receive-panel-box"
            animation={
              isSwapping
                ? `${reverseSwapAnimation} 0.5s ease-in-out forwards`
                : undefined
            }
            zIndex={0}
          >
            <SwapInputPanel
              type="receive"
              id="swap-input-receive-panel"
              value={formattedAmounts[Field.RECEIVE]}
              onChange={handleTypeOutput}
              onTokenSelect={handleOutputSelect}
              isReadOnly
              isLoading={tradeLoading}
              tokenWithBalance={tokenBalances[Field.RECEIVE]}
              isFiatInput={isFiatInput}
              setIsFiatInput={setIsFiatInput}
              priceImpact={priceImpact}
            />
          </Box>
          <SwitchDirectionButton
            aria-label="Switch input and output"
            icon={
              !isSwapping ? (
                <AnimatedSwitchDirectionIcon
                  showAnimation={showIconAnimation}
                />
              ) : undefined
            }
            onClick={handleSwitchTokens}
          />
        </Flex>

        <SwapPriceImpact priceImpact={priceImpact} />

        {!canShowSwapQuote ||
          (!trade && !tradeLoading && (
            <L2Bold color="neutrals.500" mt="2">
              Powered by AVNU
            </L2Bold>
          ))}

        {canShowSwapQuote && (
          <SwapPricesInfo trade={trade} isLoading={tradeLoading} />
        )}
      </SwapContainer>
      <Flex flex={1} />
      <Box mx="4">
        {isValid ? (
          <Button
            data-testid="review-swap-button"
            w="100%"
            bg="primary.500"
            mb="3"
            isDisabled={
              !formattedAmounts[Field.PAY] ||
              !formattedAmounts[Field.RECEIVE] ||
              tradeLoading
            }
            onClick={() => void handleSwap()}
          >
            Review swap
          </Button>
        ) : (
          <Button
            w="100%"
            bg={
              swapInputError === SwapInputError.NO_AMOUNT
                ? "primary.500"
                : "error.500"
            }
            mb="3"
            isDisabled
            data-testid="swap-error-button"
          >
            {swapInputError ? (
              <>{swapInputError}</>
            ) : insufficientLiquidityError ? (
              <>{insufficientLiquidityError}</>
            ) : swapUnavailable ? (
              <>Swap currently unavailable</>
            ) : (
              <>Unknown Error</>
            )}
          </Button>
        )}
      </Box>
      <UnverifiedTokenWarningDialog
        isOpen={isUnverifiedTokenWarningModalOpen}
        onClose={onUnverifiedTokenWarningModalClose}
      />
    </>
  )
}

export { Swap }
