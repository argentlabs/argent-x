import { Button, H6, Input, L2, LoadingPulse, P4, icons } from "@argent/ui"
import {
  Currency,
  CurrencyAmount,
  ETHER,
  TokenAmount,
  WrappedTokenInfo,
  useAllTokens,
  useSwapProvider,
  wrappedCurrency,
} from "@argent/x-swap"
import { Flex, useDisclosure } from "@chakra-ui/react"
import { debounce } from "lodash-es"
import { FC, useCallback, useEffect, useMemo, useState } from "react"

import { isAllowedNumericInputValue } from "../../../components/utils/isAllowedNumericInputValue"
import { TokenIcon } from "../../accountTokens/TokenIcon"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"
import { CurrencyValue } from "./CurrencyValue"
import { MaxEthModal } from "./MaxEthModal"
import { SwapTokensModal } from "./SwapTokensModal"

const { ChevronDownIcon } = icons

interface SwapInputPanelProps {
  value: string
  type: "pay" | "receive"
  onUserInput: (value: string) => void
  onMax?: () => void
  currency?: Currency | undefined
  showMaxButton?: boolean
  onCurrencySelect: (currency: Currency) => void
  currentBalance?: CurrencyAmount | TokenAmount
  otherCurrency?: Currency | null
  id: string
  ownedTokens?: TokenDetailsWithBalance[]
  tradeLoading: boolean
  insufficientBalance?: boolean
}

const SwapInputPanel: FC<SwapInputPanelProps> = ({
  id,
  value,
  onUserInput,
  type,
  currency,
  currentBalance,
  onCurrencySelect,
  onMax,
  showMaxButton = false,
  otherCurrency,
  ownedTokens,
  tradeLoading,
  insufficientBalance,
}) => {
  const { networkId } = useSwapProvider()
  const allTokens = useAllTokens()
  const {
    isOpen: isOpenEthModal,
    onOpen: onOpenEthModal,
    onClose: onCloseEthModal,
  } = useDisclosure()
  const {
    isOpen: isTokenListOpen,
    onOpen: onOpenTokenList,
    onClose: onCloseTokenList,
  } = useDisclosure()

  const [inputValue, setInputValue] = useState("")

  const token = useMemo(() => {
    const wrapped = wrappedCurrency(currency, networkId)
    return wrapped ? (allTokens[wrapped.address] as WrappedTokenInfo) : null
  }, [allTokens, currency, networkId])

  const availableBuyTokens = useMemo(() => {
    if (!otherCurrency) {
      return Object.values(allTokens)
    }
    const wrapped = wrappedCurrency(otherCurrency, networkId)
    const copy = { ...allTokens }
    if (wrapped) {
      delete copy[wrapped.address]
      return Object.values(copy)
    }

    return Object.values(allTokens)
  }, [allTokens, networkId, otherCurrency])

  const availableSellTokens = useMemo(() => {
    return Object.values(allTokens).filter((t) => {
      if (ownedTokens) {
        return ownedTokens.some((ot) => ot.address === t.address)
      }
      return false
    })
  }, [allTokens, ownedTokens])

  const onMaxCheck = useCallback(() => {
    if (currency === ETHER) {
      onOpenEthModal()
    }
  }, [currency, onOpenEthModal])

  // eslint-disable-next-line
  const delayedOnChange = useCallback(
    debounce((value: string) => {
      if (isAllowedNumericInputValue(value)) {
        onUserInput(value)
      }
    }, 500),
    [],
  )

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    delayedOnChange(e.target.value)
  }

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
                    url={token?.image}
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
              <CurrencyValue
                amount={value}
                token={token}
                approx={type === "receive"}
              />
            )}
          </Flex>
          <L2 fontWeight="500" color="neutrals.400">
            Balance: {currentBalance?.toSignificant(6) ?? 0}
          </L2>
        </Flex>
      </Flex>

      {showMaxButton && (
        <MaxEthModal
          isOpen={isOpenEthModal}
          onClose={onCloseEthModal}
          onMax={onMax}
        />
      )}

      {(ownedTokens || availableBuyTokens) && (
        <SwapTokensModal
          isOpen={isTokenListOpen}
          onClose={onCloseTokenList}
          isPay={type === "pay"}
          tokens={type === "pay" ? availableSellTokens : availableBuyTokens}
          onCurrencySelect={onCurrencySelect}
        />
      )}
    </>
  )
}

export { SwapInputPanel }
