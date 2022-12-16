import { CellStack, H5, SearchInput } from "@argent/ui"
import { Currency, ETHER, Token } from "@argent/x-swap"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@chakra-ui/react"
import { FC, Fragment, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { TokenDetailsWithBalance } from "../../accountTokens/tokens.state"
import { OwnedToken } from "./OwnedToken"
import { TokenPrice } from "./TokenPrice"

interface SwapTokensModalProps {
  currency?: Currency | undefined
  isOpen: boolean
  onClose: () => void
  onCurrencySelect: (currency: Currency) => void
  isPay: boolean
  tokens: Token[]
}

const SwapTokensModal: FC<SwapTokensModalProps> = ({
  onClose,
  onCurrencySelect,
  isOpen,
  isPay,
  tokens,
}) => {
  const { register, watch } = useForm({
    defaultValues: { query: "" },
  })
  const currentQueryValue = watch("query")

  const filteredTokens = useMemo(() => {
    if (!currentQueryValue) {
      return tokens
    }

    return tokens.filter(
      (token: any) =>
        token.name?.toLowerCase().includes(currentQueryValue.toLowerCase()) ||
        token.symbol?.toLowerCase().includes(currentQueryValue.toLowerCase()) ||
        token.address?.toLowerCase().includes(currentQueryValue.toLowerCase()),
    )
  }, [tokens, currentQueryValue])

  const selectToken = useCallback(
    (token: Token) => {
      onCurrencySelect(token.symbol === "ETH" ? ETHER : token)
      onClose()
    },
    [onCurrencySelect, onClose],
  )

  if (!filteredTokens) {
    return <></>
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalContent bg="neutrals.900">
          <ModalHeader>
            <H5 fontWeight="600" textAlign="center">
              {isPay ? "Pay with" : "Receive "}
            </H5>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody flexDirection="column">
            <CellStack px="0" gap={3}>
              <SearchInput placeholder="Search" {...register("query")} />

              {filteredTokens.map((token: any) => (
                <Fragment key={token.address}>
                  {isPay ? (
                    <OwnedToken
                      key={token.address}
                      token={token}
                      amount={token.balance ?? 0}
                      onClick={() => {
                        selectToken(token)
                      }}
                    />
                  ) : (
                    <TokenPrice
                      key={token.address}
                      onClick={() => {
                        selectToken(token)
                      }}
                      token={token as TokenDetailsWithBalance}
                    />
                  )}
                </Fragment>
              ))}
            </CellStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export { SwapTokensModal }
