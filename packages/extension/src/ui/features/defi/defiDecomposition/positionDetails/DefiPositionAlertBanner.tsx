import { useEffect, useMemo, useState, type FC } from "react"
import {
  isStrkDelegatedStakingPosition,
  type ParsedPosition,
} from "../../../../../shared/defiDecomposition/schema"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import { H5, P4 } from "@argent/x-ui"
import { useTokenAmountToCcyCallback } from "../../../../hooks/useTokenAmountToCcyCallback"
import { Button, Flex, Spinner } from "@chakra-ui/react"
import type { Address } from "@argent/x-shared"
import { prettifyCurrencyValue } from "@argent/x-shared"
import { useAction } from "../../../../hooks/useAction"
import { stakingService } from "../../../../services/staking"
import { useNavigate } from "react-router-dom"
import { useRouteAccountDefi } from "../../../../hooks/useRoute"
import { getActiveFromNow } from "../../../../../shared/utils/getActiveFromNow"

interface DefiPositionAlertBannerProps {
  position: ParsedPosition
  account: WalletAccount
}

export const DefiPositionAlertBanner: FC<DefiPositionAlertBannerProps> = ({
  position,
  account,
}) => {
  const tokenAmountToCcyCallback = useTokenAmountToCcyCallback()
  const { action: unstakeAction, loading: unstakeLoading } = useAction(
    stakingService.unstake.bind(stakingService),
  )
  const navigate = useNavigate()
  const defiRoute = useRouteAccountDefi()

  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const content = useMemo(() => {
    if (
      isStrkDelegatedStakingPosition(position) &&
      position.pendingWithdrawal
    ) {
      const title = tokenAmountToCcyCallback(
        position.token,
        position.pendingWithdrawal.amount,
      )
      const timeToAction = getActiveFromNow(
        position.pendingWithdrawal.withdrawableAfter,
      )

      if (timeToAction.activeFromNowMs !== 0) {
        return {
          title,
          subtitle: (
            <P4 color="text-secondary">
              Withdraw available in {timeToAction.activeFromNowPretty}
            </P4>
          ),
          action: <Spinner size="sm" color="text-primary" />,
        }
      }

      const onWithdraw = () => {
        void unstakeAction({
          accountAddress: account.address as Address,
          accountType: account.type,
          amount: position.token.balance,
          stakerInfo: position.stakerInfo,
          tokenAddress: position.token.address,
          investmentId: position.investmentId,
        })

        navigate(defiRoute)
      }

      return {
        title,
        subtitle: <P4 color="text-brand">Ready to withdraw</P4>,
        action: (
          <WithdrawButton onClick={onWithdraw} isLoading={unstakeLoading} />
        ),
      }
    }

    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    account.address,
    currentTime,
    defiRoute,
    navigate,
    position,
    tokenAmountToCcyCallback,
    unstakeAction,
    unstakeLoading,
  ])

  if (!content) {
    return null
  }

  return (
    <Flex
      w="full"
      bgColor="surface-elevated"
      boxShadow="elevated"
      borderRadius="xl"
      mt={0}
      mb={8}
      justifyContent="space-between"
      alignItems="center"
      py={3.5}
      px={4}
    >
      <Flex flexDir="column" gap="0.5">
        <H5>{prettifyCurrencyValue(content.title)}</H5>
        {content.subtitle}
      </Flex>
      {content.action}
    </Flex>
  )
}

const WithdrawButton: FC<{ onClick: () => void; isLoading: boolean }> = ({
  onClick,
  isLoading,
}) => {
  return (
    <Button
      bg="button-primary"
      borderRadius="full"
      py={2}
      px={3}
      h="auto"
      minW={0}
      minH={0}
      fontSize="b3"
      isLoading={isLoading}
      onClick={onClick}
    >
      Withdraw
    </Button>
  )
}
