import type { Address } from "@argent/x-shared"

import {
  InvestSecondaryIcon,
  ArrowDownSecondaryIcon,
  SparkleSecondaryIcon,
  SendSecondaryIcon,
  SwapPrimaryIcon,
} from "@argent/x-ui/icons"

import { HStack, useDisclosure } from "@chakra-ui/react"
import type { FC } from "react"
import { Suspense } from "react"
import { useNavigate } from "react-router-dom"
import type {
  ParsedStakingPosition,
  ParsedStrkDelegatedStakingPosition,
} from "../../../../../shared/defiDecomposition/schema"
import {
  isStakingPosition,
  isStrkDelegatedStakingPosition,
  type ParsedPosition,
} from "../../../../../shared/defiDecomposition/schema"
import { checkHasRewards } from "../../../../../shared/staking/utils"
import { routes } from "../../../../../shared/ui/routes"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import { ActionButton } from "../../../../components/ActionButton"
import { useAction } from "../../../../hooks/useAction"
import {
  useCurrentPathnameWithQuery,
  useRouteAccountDefi,
} from "../../../../hooks/useRoute"
import { stakingService } from "../../../../services/staking"
import { WithdrawWarningModalContainer } from "../../staking/WithdrawWarningModal"

interface DefiPositionDetailsActionsProps {
  position: ParsedPosition
  account: WalletAccount
}

export const DefiPositionDetailsActions: FC<
  DefiPositionDetailsActionsProps
> = ({ position, account }: DefiPositionDetailsActionsProps) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  const defiRoute = useRouteAccountDefi()

  const { action: claimAction } = useAction(
    stakingService.claim.bind(stakingService),
  )

  const {
    onOpen: onWithdrawWarningOpen,
    onClose: onWithdrawWarningClose,
    isOpen: isWithdrawWarningOpen,
  } = useDisclosure()

  const Stake: FC<{
    position: ParsedStrkDelegatedStakingPosition | ParsedStakingPosition
  }> = ({ position }) => {
    if (!position.investmentId) {
      return null
    }

    const onStake = () => {
      if (isStrkDelegatedStakingPosition(position)) {
        void navigate(routes.nativeStaking(position.investmentId, returnTo))
      } else if (isStakingPosition(position)) {
        void navigate(routes.liquidStaking(position.investmentId, returnTo))
      }
    }
    return (
      <ActionButton
        icon={<InvestSecondaryIcon />}
        label="Stake"
        onClick={onStake}
      />
    )
  }

  const Withdraw: FC<{
    position: ParsedStrkDelegatedStakingPosition | ParsedStakingPosition
  }> = ({ position }) => {
    if (!position.investmentId) {
      return null
    }

    const isWithdrawDisabled =
      isStrkDelegatedStakingPosition(position) &&
      position.pendingWithdrawal?.amount === position.token.balance

    const onWithdraw = () => {
      if (isStrkDelegatedStakingPosition(position)) {
        if (position.pendingWithdrawal) {
          onWithdrawWarningOpen()
          return
        }

        void navigate(routes.nativeUnstake(position.id, returnTo))
      } else if (isStakingPosition(position)) {
        void navigate(routes.liquidUnstake(position.id, returnTo))
      }
    }
    return (
      <ActionButton
        icon={<ArrowDownSecondaryIcon />}
        label="Withdraw"
        onClick={onWithdraw}
        isDisabled={isWithdrawDisabled}
      />
    )
  }

  const Claim: FC<{ position: ParsedStrkDelegatedStakingPosition }> = ({
    position,
  }) => {
    if (!position.investmentId) {
      return null
    }

    return (
      <ActionButton
        icon={<SparkleSecondaryIcon />}
        label="Claim"
        onClick={() => {
          if (!position.investmentId) {
            return
          }

          void claimAction({
            accountAddress: account.address as Address,
            accountType: account.type,
            amount: position.accruedRewards,
            investmentId: position.investmentId,
            stakerInfo: position.stakerInfo,
            tokenAddress: position.token.address,
          })
          void navigate(defiRoute)
        }}
        isDisabled={
          !checkHasRewards(position.accruedRewards) ||
          Boolean(position.pendingWithdrawal)
        }
      />
    )
  }

  const Send: FC<{ address: Address }> = ({ address }) => (
    <ActionButton
      icon={<SendSecondaryIcon />}
      label="Send"
      onClick={() =>
        void navigate(
          routes.sendRecipientScreen({ returnTo, tokenAddress: address }),
        )
      }
    />
  )

  const Swap: FC<{ address: Address }> = ({ address }) => {
    return (
      <ActionButton
        icon={<SwapPrimaryIcon />}
        label="Swap"
        onClick={() => void navigate(routes.swapToken(address, returnTo))}
      />
    )
  }

  const Actions: FC<{ position: ParsedPosition }> = ({ position }) => {
    if (isStrkDelegatedStakingPosition(position)) {
      return (
        <>
          <Stake position={position} />
          <Withdraw position={position} />
          <Claim position={position} />
        </>
      )
    } else if (isStakingPosition(position)) {
      const token = position.liquidityToken
      if (!token) {
        return null
      }
      return (
        <Suspense fallback={null}>
          <Send address={token.address} />
          <Swap address={token.address} />
        </Suspense>
      )
    }
  }

  return (
    <>
      <HStack spacing="6" my="8">
        <Actions position={position} />
      </HStack>

      {/** Modals */}
      <WithdrawWarningModalContainer
        isOpen={isWithdrawWarningOpen}
        onClose={onWithdrawWarningClose}
        position={position}
      />
    </>
  )
}
