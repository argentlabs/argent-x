import { prettifyCurrencyValue } from "@argent/x-shared"
import { HeaderCell, Label1 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import React from "react"
import type { ParsedPositionWithUsdValue } from "../../../../../shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "../../../../../shared/defiDecomposition/schema"
import type { BaseWalletAccount } from "../../../../../shared/wallet.model"
import { TokenInfo } from "../../TokenInfo"

interface DefiPositionDetailsTokensInfoProps {
  position: ParsedPositionWithUsdValue
  account: BaseWalletAccount
}

const TokensInfoGroup: React.FC<{
  title: string
  totalUsdValue?: string
  isDebtPosition?: boolean
  children: React.ReactNode
}> = ({ title, totalUsdValue, isDebtPosition, children }) => (
  <Flex flexDirection="column" gap="2">
    <HeaderCell display="flex" justifyContent="space-between" width="full">
      {title}
      {totalUsdValue && (
        <Label1 textColor="text-secondary">
          {isDebtPosition && "-"}
          {prettifyCurrencyValue(totalUsdValue, undefined, {
            allowLeadingZerosInDecimalPart: false,
          })}
        </Label1>
      )}
    </HeaderCell>
    {children}
  </Flex>
)

export const DefiPositionDetailsTokensInfo: React.FC<
  DefiPositionDetailsTokensInfoProps
> = ({ position, account }) => {
  if (isCollateralizedDebtLendingPosition(position)) {
    return (
      <TokensInfoGroup title="Deposited & earning">
        <TokenInfo
          address={position.token.address}
          balance={position.token.balance}
          usdValue={position.token.usdValue}
          account={account}
          totalApy={position.totalApy}
        />
      </TokensInfoGroup>
    )
  }

  if (isCollateralizedDebtBorrowingPosition(position)) {
    return (
      <Flex flexDirection="column" gap="4">
        <TokensInfoGroup
          title="Debt"
          isDebtPosition={true}
          totalUsdValue={
            position.debtPositions.length > 1
              ? position.debtPositionsTotalUsdValue
              : undefined
          }
        >
          {position.debtPositions.map((debtPosition) => (
            <TokenInfo
              key={debtPosition.token.address}
              address={debtPosition.token.address}
              balance={debtPosition.token.balance}
              usdValue={debtPosition.token.usdValue}
              account={account}
              isDebtPosition={true}
              totalApy={debtPosition.totalApy}
            />
          ))}
        </TokensInfoGroup>
        <TokensInfoGroup
          title="Collateral & earning"
          totalUsdValue={
            position.collateralizedPositions.length > 1
              ? position.collateralizedPositionsTotalUsdValue
              : undefined
          }
        >
          {position.collateralizedPositions.map((collateralPosition) => (
            <TokenInfo
              key={collateralPosition.token.address}
              address={collateralPosition.token.address}
              balance={collateralPosition.token.balance}
              usdValue={collateralPosition.token.usdValue}
              account={account}
            />
          ))}
        </TokensInfoGroup>
      </Flex>
    )
  }

  if (isStrkDelegatedStakingPosition(position)) {
    return (
      <TokensInfoGroup title="Staked & earning">
        <TokenInfo
          address={position.token.address}
          balance={position.stakedAmount}
          usdValue={position.token.usdValue}
          account={account}
          totalApy={position.totalApy}
        />
      </TokensInfoGroup>
    )
  }

  if (isStakingPosition(position)) {
    return (
      <TokensInfoGroup title="Staked & earning">
        <TokenInfo
          address={position.token.address}
          balance={position.token.balance}
          usdValue={position.token.usdValue}
          account={account}
          totalApy={position.totalApy}
        />
      </TokensInfoGroup>
    )
  }

  if (isDelegatedTokensPosition(position)) {
    return (
      <TokensInfoGroup title="Asset">
        <TokenInfo
          address={position.token.address}
          balance={position.token.balance}
          usdValue={position.token.usdValue}
          account={account}
        />
      </TokensInfoGroup>
    )
  }

  if (isConcentratedLiquidityPosition(position)) {
    return (
      <Flex flexDirection="column" gap="4">
        <TokensInfoGroup title="Base asset">
          <TokenInfo
            address={position.token1.address}
            balance={position.token1.balance}
            usdValue={position.token1.usdValue}
            account={account}
          />
        </TokensInfoGroup>
        <TokensInfoGroup title="Quote asset">
          <TokenInfo
            address={position.token0.address}
            balance={position.token0.balance}
            usdValue={position.token0.usdValue}
            account={account}
          />
        </TokensInfoGroup>
      </Flex>
    )
  }

  return null
}
