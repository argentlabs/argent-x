import { icons } from "@argent/x-ui"
import { Center, Skeleton } from "@chakra-ui/react"
import type { FC } from "react"

import { MultisigHideModal } from "../multisig/MultisigHideModal"
import { ActionButton } from "../../components/ActionButton"

const {
  PlusSecondaryIcon,
  SendSecondaryIcon,
  HideSecondaryIcon,
  SwapPrimaryIcon,
} = icons

export interface AccountTokensButtonsProps {
  hasNonZeroBalance: boolean
  isHideMultisigModalOpen: boolean
  onAddFunds: () => void
  onHideConfirm: () => Promise<void>
  onHideMultisigModalClose: () => void
  onHideMultisigModalOpen: () => void
  onSend: () => void
  onSwap: () => void
  showAddFundsButton: boolean
  showHideMultisigButton?: boolean
  showSendButton: boolean
  showSwapButton: boolean
}

export const AccountTokensButtonsSkeleton: FC = () => {
  return (
    <Center gap={10} pb={6}>
      <Skeleton rounded="full" w={12} h={12} />
      <Skeleton rounded="full" w={12} h={12} />
      <Skeleton rounded="full" w={12} h={12} />
    </Center>
  )
}

export const AccountTokensButtons: FC<AccountTokensButtonsProps> = ({
  hasNonZeroBalance,
  isHideMultisigModalOpen,
  onAddFunds,
  onHideConfirm,
  onHideMultisigModalClose,
  onHideMultisigModalOpen,
  onSend,
  onSwap,
  showAddFundsButton,
  showHideMultisigButton,
  showSendButton,
  showSwapButton,
}) => {
  if (
    !showAddFundsButton &&
    !showSendButton &&
    !showSwapButton &&
    !showHideMultisigButton
  ) {
    return null
  }
  return (
    <>
      <Center gap={9}>
        {showAddFundsButton && (
          <ActionButton
            colorScheme="primary"
            onClick={onAddFunds}
            icon={<PlusSecondaryIcon />}
            label="Fund"
          />
        )}
        {showSendButton && (
          <ActionButton
            onClick={onSend}
            colorScheme={hasNonZeroBalance ? "primary" : undefined}
            icon={<SendSecondaryIcon />}
            label="Send"
          />
        )}
        {showSwapButton && (
          <ActionButton
            onClick={onSwap}
            colorScheme={hasNonZeroBalance ? "primary" : undefined}
            icon={<SwapPrimaryIcon />}
            label="Swap"
          />
        )}
        {showHideMultisigButton && (
          <ActionButton
            onClick={onHideMultisigModalOpen}
            icon={<HideSecondaryIcon />}
            label="Hide"
          />
        )}
      </Center>
      <MultisigHideModal
        onClose={onHideMultisigModalClose}
        isOpen={isHideMultisigModalOpen}
        onHide={onHideConfirm}
        multisigType="active"
      />
    </>
  )
}
