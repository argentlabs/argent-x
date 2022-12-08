import {
  Button,
  CellStack,
  H5,
  H6,
  Input,
  L2,
  LoadingPulse,
  P4,
  SearchInput,
  icons,
} from "@argent/ui"
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
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@chakra-ui/react"
import { FC, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { isAllowedNumericInputValue } from "../../../components/utils/isAllowedNumericInputValue"
import { TokenIcon } from "../../accountTokens/TokenIcon"
import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"
import { CurrencyValue } from "./CurrencyValue"
import { MaxEthModal } from "./MaxEthModal"
import { OwnedToken } from "./OwnedToken"
import { TokenPrice } from "./TokenPrice"

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
  const { register, watch } = useForm({
    defaultValues: { query: "" },
  })
  const currentQueryValue = watch("query")
  const { networkId } = useSwapProvider()
  const allTokens = useAllTokens()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isTokenListOpen,
    onOpen: onOpenTokenList,
    onClose: onCloseTokenList,
  } = useDisclosure()

  const token = useMemo(() => {
    const wrapped = wrappedCurrency(currency, networkId)
    return wrapped ? (allTokens[wrapped.address] as WrappedTokenInfo) : null
  }, [allTokens, currency, networkId])

  const availableBuyTokens = useMemo(() => {
    if (!otherCurrency) {
      return allTokens
    }
    const wrapped = wrappedCurrency(otherCurrency, networkId)
    const copy = { ...allTokens }
    if (wrapped) {
      delete copy[wrapped.address]
      return copy
    }

    return allTokens
  }, [allTokens, networkId, otherCurrency])

  const onMaxCheck = useCallback(() => {
    if (currency === ETHER) {
      onOpen()
    }
  }, [currency, onOpen])

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
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (isAllowedNumericInputValue(e.target.value)) {
                  onUserInput(e.target.value)
                }
              }}
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
        <MaxEthModal isOpen={isOpen} onClose={onClose} onMax={onMax} />
      )}

      <Modal
        isOpen={isTokenListOpen}
        onClose={onCloseTokenList}
        isCentered
        size="full"
      >
        <ModalContent bg="neutrals.900">
          <ModalHeader>
            <H5 fontWeight="600" textAlign="center">
              {type === "pay" ? "Pay with" : "Receive "}
            </H5>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody flexDirection="column">
            <CellStack px="0" gap={3}>
              <SearchInput placeholder="Search" {...register("query")} />
              {type === "pay" ? (
                <>
                  {ownedTokens
                    ?.filter((token) =>
                      currentQueryValue
                        ? token.name
                            ?.toLowerCase()
                            .includes(currentQueryValue.toLowerCase()) ||
                          token.symbol
                            ?.toLowerCase()
                            .includes(currentQueryValue.toLowerCase())
                        : token,
                    )
                    .map((token) => (
                      <OwnedToken
                        key={token.address}
                        token={token}
                        amount={token.balance ?? 0}
                        onClick={() => {
                          onCurrencySelect(
                            currency === ETHER ? currency : token,
                          )
                          onCloseTokenList()
                        }}
                      />
                    ))}
                </>
              ) : (
                <>
                  {Object.values(availableBuyTokens)
                    ?.filter((token) =>
                      currentQueryValue
                        ? token.name
                            ?.toLowerCase()
                            .includes(currentQueryValue.toLowerCase()) ||
                          token.symbol
                            ?.toLowerCase()
                            .includes(currentQueryValue.toLowerCase())
                        : token,
                    )
                    .map((token) => (
                      <TokenPrice
                        key={token.address}
                        onClick={() => {
                          onCurrencySelect(
                            currency === ETHER ? currency : token,
                          )
                          onCloseTokenList()
                        }}
                        token={token as TokenDetailsWithBalance}
                      />
                    ))}
                </>
              )}
            </CellStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export { SwapInputPanel }
