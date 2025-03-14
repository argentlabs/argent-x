import { H4, ModalDialog, P2 } from "@argent/x-ui"
import { Button, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import {
  isStrkDelegatedStakingPosition,
  type ParsedPosition,
} from "../../../../shared/defiDecomposition/schema"
import { isWithdrawAvailable } from "../../../../shared/staking/utils"

import type { Address } from "@argent/x-shared"
import { prettifyCurrencyValue } from "@argent/x-shared"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../../shared/ui/routes"
import { useAction } from "../../../hooks/useAction"
import { useCurrentPathnameWithQuery } from "../../../hooks/useRoute"
import { useTokenAmountToCcyCallback } from "../../../hooks/useTokenAmountToCcyCallback"
import { stakingService } from "../../../services/staking"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"

interface WithdrawWarningModalProps {
  isOpen: boolean
  onClose: () => void
  position: ParsedPosition
}

export const WithdrawWarningModalContainer: FC<WithdrawWarningModalProps> = ({
  isOpen,
  onClose,
  position,
}) => {
  const tokenAmountToCcyCallback = useTokenAmountToCcyCallback()
  const navigate = useNavigate()
  const account = useView(selectedAccountView)
  const returnTo = useCurrentPathnameWithQuery()

  const { action: unstakeAction } = useAction(
    stakingService.unstake.bind(stakingService),
  )

  if (!isStrkDelegatedStakingPosition(position)) {
    return null
  }

  const amount = tokenAmountToCcyCallback(
    position.token,
    position.pendingWithdrawal?.amount ?? "0",
  )

  const prettifiedAmount = prettifyCurrencyValue(amount)

  const isWithdrawCurrentlyAvailable = isWithdrawAvailable(position)

  const onWithdraw = () => {
    onClose()

    if (isWithdrawCurrentlyAvailable && account && position.investmentId) {
      void unstakeAction({
        accountAddress: account.address as Address,
        accountType: account.type,
        amount: position.token.balance,
        investmentId: position.investmentId,
        stakerInfo: position.stakerInfo,
        tokenAddress: position.token.address,
      })
    } else {
      void navigate(routes.nativeUnstake(position.id, returnTo))
    }
  }

  return (
    <WithdrawWarningModal
      isOpen={isOpen}
      onClose={onClose}
      onWithdraw={onWithdraw}
      isWithdrawCurrentlyAvailable={isWithdrawCurrentlyAvailable}
      prettifiedAmount={prettifiedAmount}
    />
  )
}

const WithdrawWarningModal: FC<{
  isOpen: boolean
  onClose: () => void
  onWithdraw: () => void
  isWithdrawCurrentlyAvailable: boolean
  prettifiedAmount: string | null
}> = ({
  isOpen,
  onClose,
  onWithdraw,
  isWithdrawCurrentlyAvailable,
  prettifiedAmount,
}) => {
  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <H4 textAlign="center">
        {isWithdrawCurrentlyAvailable
          ? "You have an outstanding balance to withdraw"
          : "Separate withdrawal already in progress"}
      </H4>
      <P2 textAlign="center" mb="5">
        {isWithdrawCurrentlyAvailable
          ? `You have a balance of ${prettifiedAmount} which needs to be withdrawn before withdrawing the new amount`
          : "There is already a previous withdrawal in progress. Creating a new withdrawal will reset the 21 days lockup period"}
      </P2>
      <Flex flexDirection="column" gap="2" p="0" w="full">
        <Button
          onClick={onWithdraw}
          colorScheme="primary"
          w="full"
          size="medium"
          _focusVisible={{
            outline: "none",
          }}
        >
          {isWithdrawCurrentlyAvailable
            ? `Withdraw ${prettifiedAmount}`
            : "Withdraw again"}
        </Button>
        <Button
          onClick={onClose}
          colorScheme="secondary"
          w="full"
          size="medium"
        >
          Cancel
        </Button>
      </Flex>
    </ModalDialog>
  )
}
