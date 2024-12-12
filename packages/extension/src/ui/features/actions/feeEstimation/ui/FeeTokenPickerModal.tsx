import type { FC } from "react"
import type { BaseToken } from "../../../../../shared/token/__new/types/token.model"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@chakra-ui/react"
import { H5 } from "@argent/x-ui"

import type { TokenWithBalance } from "../../../../../shared/token/__new/types/tokenBalance.model"
import type { MinBalances } from "./TokenOptionContainer"
import { TokenOptionContainer } from "./TokenOptionContainer"

export interface FeeTokenPickerModalProps {
  onClose: () => void
  onFeeTokenSelect: (token: BaseToken) => void
  isOpen: boolean
  tokens: TokenWithBalance[]
  minBalances?: MinBalances
  initialFocusRef?: React.RefObject<HTMLDivElement>
}

export const FeeTokenPickerModal: FC<FeeTokenPickerModalProps> = ({
  onClose,
  onFeeTokenSelect,
  isOpen,
  tokens,
  minBalances = {},
  initialFocusRef,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      initialFocusRef={initialFocusRef}
    >
      <ModalContent bg="surface-default">
        <ModalHeader>
          <H5 fontWeight="600" textAlign="center">
            Select fee token
          </H5>
        </ModalHeader>
        <ModalCloseButton autoFocus={false} />
        <ModalBody display="flex" flexDirection="column" px={4} py={2} gap={2}>
          {tokens.map((token, i) => (
            <TokenOptionContainer
              key={token.address}
              ref={i === 0 ? initialFocusRef : undefined}
              onFeeTokenSelect={onFeeTokenSelect}
              token={token}
              minBalances={minBalances}
            />
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
