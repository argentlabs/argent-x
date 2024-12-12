import type { Address } from "@argent/x-shared"
import {
  bigDecimal,
  prettifyCurrencyNumber,
  prettifyCurrencyValue,
} from "@argent/x-shared"
import { H5, L2Bold, P4, TokenIcon, useToken } from "@argent/x-ui"
import { Flex, HStack } from "@chakra-ui/react"
import type { FC } from "react"
import { Suspense, useMemo } from "react"
import { prettifyTokenBalance } from "../../../shared/token/prettifyTokenBalance"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { DefiPositionSkeleton } from "./defiDecomposition/DefiPositionSkeleton"

export interface TokenInfoProps {
  address: Address
  balance: string
  usdValue: string
  account: BaseWalletAccount
  isDebtPosition?: boolean
  totalApy?: string
}

export const TokenInfo: FC<TokenInfoProps> = ({
  address,
  balance,
  usdValue,
  account,
  isDebtPosition,
  totalApy,
}) => {
  const tokenInfo = useToken({
    address,
    networkId: account.networkId,
  })

  const displayCurrencyValue = prettifyCurrencyValue(usdValue, undefined, {
    allowLeadingZerosInDecimalPart: false,
  })

  const apyPercentage = useMemo(() => {
    if (totalApy) {
      return bigDecimal.formatUnits(
        bigDecimal.mul(
          bigDecimal.parseUnits(totalApy),
          bigDecimal.toBigDecimal(100, 0),
        ),
      )
    }
    return null
  }, [totalApy])

  if (!tokenInfo) {
    return null
  }

  const displayBalance = prettifyTokenBalance({
    ...tokenInfo,
    balance: BigInt(balance),
  })

  return (
    <Suspense fallback={<DefiPositionSkeleton />}>
      <Flex
        px="4"
        py="3"
        justifyContent="space-between"
        align="center"
        borderRadius="xl"
        bgColor="surface-elevated"
      >
        <HStack gap="3">
          <TokenIcon
            size={10}
            url={tokenInfo?.iconUrl}
            name={tokenInfo?.name}
          />
          <Flex direction="column" gap="1px">
            <H5>{tokenInfo?.name}</H5>
            {apyPercentage && (
              <P4 color="text-secondary">
                {prettifyCurrencyNumber(apyPercentage)}%{" "}
                {isDebtPosition ? "APR" : "APY"}
              </P4>
            )}
          </Flex>
        </HStack>

        <Flex flexDirection="column" align="flex-end" gap="1px">
          <H5>
            {isDebtPosition && "-"}
            {displayCurrencyValue}
          </H5>
          <L2Bold color="text-secondary">{displayBalance}</L2Bold>
        </Flex>
      </Flex>
    </Suspense>
  )
}
