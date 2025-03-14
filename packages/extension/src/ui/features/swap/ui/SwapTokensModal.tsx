import { B2, CellStack, H4, H5, L1, SearchInput, TokenIcon } from "@argent/x-ui"
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { StarSecondaryIcon } from "@argent/x-ui/icons"
import type { Token } from "../../../../shared/token/__new/types/token.model"
import {
  isTokenVerified,
  useTradableTokensInCurrentNetwork,
} from "../../accountTokens/tokens.state"
import { sortSwapTokens } from "../utils"
import { PayToken } from "./PayToken"
import { ReceiveToken } from "./ReceiveToken"
import { isAddress, stripAddressZeroPadding } from "@argent/x-shared"

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
  const { register, watch, reset } = useForm({
    defaultValues: { query: "" },
  })
  const currentQueryValue = watch("query")
  const tokens = useTradableTokensInCurrentNetwork()
  const verifiedTokens = useMemo(
    () => tokens.filter((token) => isTokenVerified(token)),
    [tokens],
  )

  // we want to allow unverified tokens on search for receive
  const filteredTokens: Token[] = useMemo(() => {
    if (!currentQueryValue) {
      return Object.values(verifiedTokens)
    }
    const tokensList = isPay ? verifiedTokens : tokens
    return Object.values(tokensList).filter((token) => {
      if (isAddress(currentQueryValue.toLowerCase())) {
        return stripAddressZeroPadding(token.address?.toLowerCase()).includes(
          stripAddressZeroPadding(currentQueryValue.toLowerCase()),
        )
      }
      return (
        token.name?.toLowerCase().includes(currentQueryValue.toLowerCase()) ||
        token.symbol?.toLowerCase().includes(currentQueryValue.toLowerCase())
      )
    })
  }, [isPay, verifiedTokens, tokens, currentQueryValue])

  const hotTokens = useMemo(() => {
    return filteredTokens.filter((token) => token.tags?.includes("top"))
  }, [filteredTokens])

  const { popularTokens, otherTokens } = useMemo(() => {
    const sorted = sortSwapTokens(filteredTokens)
    return {
      popularTokens: sorted.filter(
        (token) => token.popular && !hotTokens.includes(token),
      ),
      otherTokens: sorted.filter(
        (token) => !token.popular && !hotTokens.includes(token),
      ),
    }
  }, [filteredTokens, hotTokens])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const selectToken = useCallback(
    (token: Token) => {
      onTokenSelect?.(token)
      handleClose()
    },
    [onTokenSelect, handleClose],
  )

  if (!filteredTokens) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      motionPreset="none"
    >
      <ModalContent bg="surface-default">
        <ModalHeader>
          <H4 fontWeight="600" textAlign="center">
            {isPay ? "Pay with" : "Receive"}
          </H4>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody flexDirection="column">
          <CellStack px="0" gap={3}>
            <SearchInput
              {...register("query")}
              placeholder="Token name or address"
            />

            {!isPay && (
              <Flex gap={2} w="full">
                {hotTokens.map((token) => (
                  <Button
                    key={token.id}
                    size="2xs"
                    p={2}
                    colorScheme="secondary"
                    flex={1}
                    gap={2}
                    onClick={() => selectToken(token)}
                  >
                    <TokenIcon
                      url={token.iconUrl}
                      name={token.symbol}
                      size={4}
                    />
                    <B2>{token.symbol}</B2>
                  </Button>
                ))}
              </Flex>
            )}

            {isPay ? (
              <Flex flexDirection="column" gap={2}>
                <Flex justifyContent="space-between" gap={2}>
                  <H5 color="text-secondary">Your tokens</H5>
                  <L1 color="text-secondary">Your balance</L1>
                </Flex>
                {sortSwapTokens(filteredTokens).map((token) => (
                  <PayToken
                    key={token.address}
                    token={token}
                    onClick={() => selectToken(token)}
                  />
                ))}
              </Flex>
            ) : (
              <>
                {popularTokens.length > 0 && (
                  <Flex flexDirection="column" gap={2}>
                    <H5
                      color="text-secondary"
                      display="flex"
                      gap={2}
                      alignItems="center"
                    >
                      <StarSecondaryIcon /> Popular tokens
                    </H5>
                    {popularTokens.map((token) => (
                      <ReceiveToken
                        key={token.address}
                        onClick={() => selectToken(token)}
                        token={token}
                      />
                    ))}
                  </Flex>
                )}

                {otherTokens.length > 0 && (
                  <Flex flexDirection="column" gap={2}>
                    <H5 color="text-secondary">Other tokens</H5>
                    {otherTokens.map((token) => (
                      <ReceiveToken
                        key={token.address}
                        onClick={() => selectToken(token)}
                        token={token}
                      />
                    ))}
                  </Flex>
                )}
              </>
            )}
          </CellStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { SwapTokensModal }
