import type { Address } from "@argent/x-shared"
import { icons } from "@argent/x-ui"
import { HStack, useDisclosure } from "@chakra-ui/react"
import type { FC } from "react"
import { Suspense } from "react"
import { useNavigate } from "react-router-dom"
import type { ParsedStrkDelegatedStakingPosition } from "../../../../../shared/defiDecomposition/schema"
import {
  isStakingPosition,
  isStrkDelegatedStakingPosition,
  type ParsedPosition,
} from "../../../../../shared/defiDecomposition/schema"
import { routes } from "../../../../../shared/ui/routes"
import { ActionButton } from "../../../../components/ActionButton"
import {
  useCurrentPathnameWithQuery,
  useRouteAccountDefi,
} from "../../../../hooks/useRoute"
import { useAction } from "../../../../hooks/useAction"
import { stakingService } from "../../../../services/staking"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import { checkHasRewards } from "../../../../../shared/staking/utils"
import { WithdrawWarningModalContainer } from "../../staking/WithdrawWarningModal"
import { useTokenInfo } from "../../../accountTokens/tokens.state"

const {
  InvestSecondaryIcon,
  ArrowDownSecondaryIcon,
  SparkleSecondaryIcon,
  SendSecondaryIcon,
  SwapPrimaryIcon,
} = icons

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

  const Stake: FC<{ position: ParsedStrkDelegatedStakingPosition }> = ({
    position,
  }) => (
    <ActionButton
      icon={<InvestSecondaryIcon />}
      label="Stake"
      onClick={() =>
        navigate(routes.nativeStaking(position.investmentId, returnTo))
      }
    />
  )

  const Withdraw: FC<{ position: ParsedStrkDelegatedStakingPosition }> = ({
    position,
  }) => (
    <>
      <ActionButton
        icon={<ArrowDownSecondaryIcon />}
        label="Withdraw"
        onClick={() =>
          position.pendingWithdrawal
            ? onWithdrawWarningOpen()
            : navigate(routes.unstake(position.id, returnTo))
        }
        isDisabled={
          position.pendingWithdrawal?.amount === position.token.balance
        }
      />
    </>
  )

  const Claim: FC<{ position: ParsedStrkDelegatedStakingPosition }> = ({
    position,
  }) => (
    <ActionButton
      icon={<SparkleSecondaryIcon />}
      label="Claim"
      onClick={() => {
        void claimAction({
          accountAddress: account.address as Address,
          accountType: account.type,
          amount: position.accruedRewards,
          investmentId: position.investmentId,
          stakerInfo: position.stakerInfo,
          tokenAddress: position.token.address,
        })
        navigate(defiRoute)
      }}
      isDisabled={
        !checkHasRewards(position.accruedRewards) ||
        Boolean(position.pendingWithdrawal)
      }
    />
  )

  const Swap: FC<{ address: Address; networkId: string }> = ({
    address,
    networkId,
  }) => {
    const tokenInfo = useTokenInfo({ address, networkId })
    if (!tokenInfo || !tokenInfo.tradable) {
      return null
    }
    return (
      <ActionButton
        icon={<SwapPrimaryIcon />}
        label="Swap"
        onClick={() => navigate(routes.swapToken(address, returnTo))}
      />
    )
  }

  const Send: FC<{ address: Address }> = ({ address }) => (
    <ActionButton
      icon={<SendSecondaryIcon />}
      label="Send"
      onClick={() =>
        navigate(
          routes.sendRecipientScreen({ returnTo, tokenAddress: address }),
        )
      }
    />
  )

  const Actions: FC<{ position: ParsedPosition }> = ({ position }) => {
    if (isStrkDelegatedStakingPosition(position)) {
      return (
        <>
          <Stake position={position} />
          <Withdraw position={position} />
          <Claim position={position} />
        </>
      )
    } else if (
      isStakingPosition(position) ||
      isStrkDelegatedStakingPosition(position)
    ) {
      const token = isStrkDelegatedStakingPosition(position)
        ? position.token
        : position.liquidityToken

      if (!token) {
        return null
      }
      return (
        <Suspense fallback={null}>
          <Send address={token.address} />
          <Swap address={token.address} networkId={token.networkId} />
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
