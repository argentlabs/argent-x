import { CellStack, H5, SearchInput } from "@argent/x-ui"
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
import { Token } from "../../../../shared/token/__new/types/token.model"
import { useTradableTokensInCurrentNetwork } from "../../accountTokens/tokens.state"
import { sortSwapTokens } from "../utils"

interface SwapTokensModalProps {
  onClose: () => void
  onTokenSelect?: (token: Token) => void
  isOpen: boolean
  isPay: boolean
}

const SwapTokensModal: FC<SwapTokensModalProps> = ({
  onClose,
  onTokenSelect,
  isOpen,
  isPay,
}) => {
  const { register, watch } = useForm({
    defaultValues: { query: "" },
  })
  const currentQueryValue = watch("query")
  const tokens = useTradableTokensInCurrentNetwork()

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
    (token: Token) => {
      onTokenSelect?.(token)
      onClose()
    },
    [onTokenSelect, onClose],
  )

  if (!filteredTokens) {
    return <></>
  }

  const sortedTokens = sortSwapTokens(filteredTokens)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="none">
        <ModalContent bg="surface-default">
          <ModalHeader>
            <H5 fontWeight="600" textAlign="center">
              {isPay ? "Pay with" : "Receive "}
            </H5>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody flexDirection="column">
            <CellStack px="0" gap={3}>
              <SearchInput {...register("query")} />

              {sortedTokens?.map((token) => (
                <Fragment key={token.address}>
                  {isPay ? (
                    <OwnedToken
                      key={token.address}
                      token={token}
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
                      token={token}
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
