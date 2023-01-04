import { CellStack, H5, SearchInput } from "@argent/ui"
import { Currency, Token, useAllTokens } from "@argent/x-swap"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@chakra-ui/react"
import { FC, Fragment, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { OwnedToken } from "./OwnedToken"
import { TokenPrice } from "./TokenPrice"

interface SwapTokensModalProps {
  onClose: () => void
  onCurrencySelect?: (currency: Currency) => void
  isOpen: boolean
  isPay: boolean
}

const SwapTokensModal: FC<SwapTokensModalProps> = ({
  onClose,
  onCurrencySelect,
  isOpen,
  isPay,
}) => {
  const { register, watch } = useForm({
    defaultValues: { query: "" },
  })
  const currentQueryValue = watch("query")
  const tokens = useAllTokens()

  const filteredTokens: Token[] = useMemo(() => {
    if (!currentQueryValue) {
      return Object.values(tokens)
    }

    return Object.values(tokens).filter(
      (token) =>
        token.name?.toLowerCase().includes(currentQueryValue.toLowerCase()) ||
        token.symbol?.toLowerCase().includes(currentQueryValue.toLowerCase()) ||
        token.address?.toLowerCase().includes(currentQueryValue.toLowerCase()),
    )
  }, [tokens, currentQueryValue])

  const selectToken = useCallback(
    (currency: Currency) => {
      onCurrencySelect?.(currency)
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

              {filteredTokens?.map((token) => (
                <Fragment key={token.address}>
                  {isPay ? (
                    <OwnedToken
                      key={token.address}
                      currency={token}
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
                      currency={token}
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
