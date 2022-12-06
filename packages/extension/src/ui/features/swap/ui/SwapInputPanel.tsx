import { Button, H5, H6, Input, L2, P3, P4, icons } from "@argent/ui"
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
import {
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"

import { isAllowedNumericInputValue } from "../../../components/utils/isAllowedNumericInputValue"
import { TokenIcon } from "../../accountTokens/TokenIcon"

const { ChevronDownIcon } = icons

interface SwapInputPanelProps {
  value: string
  type: "pay" | "receive"
  onUserInput: (value: string) => void
  onMax?: () => void
  currency?: Currency | undefined
  showMaxButton?: boolean
  //   label?: string
  onCurrencySelect?: (currency: Currency) => void
  currentBalance?: CurrencyAmount | TokenAmount
  //   disableCurrencySelect?: boolean
  //   hideBalance?: boolean
  //   hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  //   showCommonBases?: boolean
  //   customBalanceText?: string
  //   disableInput?: boolean
}

const SwapInputPanel: FC<SwapInputPanelProps> = (
  {
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
  }, //   onMax,
) =>
  //   showMaxButton,
  //   label,
  //   disableCurrencySelect = false,
  //   hideInput = false,
  //   otherCurrency,
  //   showCommonBases,
  //   disableInput = false,
  {
    const { networkId } = useSwapProvider()
    const allTokens = useAllTokens()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const token: WrappedTokenInfo | null = useMemo(() => {
      const wrapped = wrappedCurrency(currency, networkId)
      if (wrapped?.address) {
        return (allTokens[wrapped?.address] as WrappedTokenInfo) || {}
      }
      return null
    }, [allTokens, currency, networkId])

    const onMaxCheck = useCallback(() => {
      if (currency === ETHER) {
        console.log("ether")
        onOpen()
      }
    }, [currency])

    return (
      <>
        <Flex
          position="relative"
          justifyContent="space-between"
          gap="2px"
          padding="16px 20px"
          backgroundColor="neutrals.800"
          width="100%"
          borderRadius={type === "pay" ? "12px 12px 0 0" : "0 0 12px 12px"}
          id={id}
        >
          <Flex flexDirection="column" gap="2px">
            <P4 color="neutrals.400">{type === "pay" ? "Pay" : "Receive"}</P4>
            <Input
              p="0"
              minH="min-content"
              variant="flat"
              placeholder="0"
              fontSize="24px"
              fontWeight="600"
              lineHeight="26px"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (isAllowedNumericInputValue(e.target.value)) {
                  onUserInput(e.target.value)
                }
              }}
            />
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
          </Flex>
          <Flex flexDirection="column" gap="2" justifyContent="center">
            {token && (
              <Button
                height="min-content"
                minH="min-content"
                width="min-content"
                backgroundColor="neutrals.900"
                rounded={"full"}
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
            )}

            <Flex justifyContent="flex-end">
              <L2 fontWeight="500" color="neutrals.400">
                Balance: {currentBalance?.toSignificant(5) ?? 0}
              </L2>
            </Flex>
          </Flex>
        </Flex>

        {showMaxButton && (
          <Modal isOpen={isOpen} onClose={onClose} isCentered size="xs">
            <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
            <ModalContent>
              <ModalHeader>
                <H5 fontWeight="600" textAlign="center">
                  Sell Max ETH?
                </H5>
              </ModalHeader>
              <ModalBody>
                <P3 fontWeight="400" textAlign="center">
                  ETH is required to pay fees so we recommend having ETH in your
                  wallet to complete transactions
                </P3>
              </ModalBody>

              <ModalFooter flexDirection="column" gap="3">
                <Button w="100%" colorScheme="primary" onClick={onMax}>
                  Use Max ETH
                </Button>
                <Button w="100%" colorScheme="neutrals" onClick={onClose}>
                  Choose different amount
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </>
    )
  }

export { SwapInputPanel }
