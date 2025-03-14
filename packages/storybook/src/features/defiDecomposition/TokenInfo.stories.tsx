import type { ParsedPositionWithUsdValue } from "@argent-x/extension/src/shared/defiDecomposition/schema"
import {
  isCollateralizedDebtBorrowingPosition,
  isCollateralizedDebtLendingPosition,
  isConcentratedLiquidityPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "@argent-x/extension/src/shared/defiDecomposition/schema"
import type { BaseWalletAccount } from "@argent-x/extension/src/shared/wallet.model"
import type { TokenInfoProps } from "@argent-x/extension/src/ui/features/defi/TokenInfo"
import { TokenInfo } from "@argent-x/extension/src/ui/features/defi/TokenInfo"
import { storybookCellStackDecorator } from "@argent/x-ui"
import type { Meta, StoryObj } from "@storybook/react"
import { ArgentDbDecorator } from "../../decorators/db/argentDbDecorator"
import { parsedPositionsWithUsdValue } from "./__fixtures__/parsedDefiDecompositionWithUsdValue"

const meta: Meta<typeof TokenInfo> = {
  component: TokenInfo,
  decorators: [storybookCellStackDecorator, ArgentDbDecorator],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj<typeof TokenInfo>

const Default = {
  args: {
    account: {
      networkId: "mainnet-alpha",
    } as BaseWalletAccount,
    isDebtPosition: false,
  },
}

const positions: ParsedPositionWithUsdValue[] =
  parsedPositionsWithUsdValue.flatMap((dapp) => {
    return dapp.products.flatMap((product) => {
      return product.positions
    })
  })

function makeProps(token: object, overrides?: object) {
  const props = {
    ...token,
    ...overrides,
  } as unknown as TokenInfoProps
  return props
}

export const DebtTokens: Story = {
  render: () => {
    return (
      <>
        {positions
          .filter((position) => isCollateralizedDebtLendingPosition(position))
          .map((position, index) => {
            return (
              <TokenInfo
                {...Default.args}
                {...makeProps(position.token, {
                  isDebtPosition: true,
                  totalApy: position.totalApy,
                })}
                key={index}
              />
            )
          })}
      </>
    )
  },
}

export const Tokens: Story = {
  render: () => {
    return (
      <>
        {positions
          .map((position) => {
            if (isCollateralizedDebtLendingPosition(position)) {
              return []
            } else if (isConcentratedLiquidityPosition(position)) {
              return [{ token: position.token0 }, { token: position.token1 }]
            } else if (isCollateralizedDebtBorrowingPosition(position)) {
              return [
                {
                  token: position.debtPositions[0].token,
                  totalApy: position.debtPositions[0].totalApy,
                },
                {
                  token: position.collateralizedPositions[0].token,
                  totalApy: position.collateralizedPositions[0].totalApy,
                },
              ]
            } else if (
              isStrkDelegatedStakingPosition(position) ||
              isStakingPosition(position)
            ) {
              return [{ token: position.token, totalApy: position.totalApy }]
            } else if (position.token) {
              return [{ token: position.token }]
            }
            return []
          })
          .flat()
          .map((result, index) => {
            return (
              <TokenInfo
                {...Default.args}
                {...makeProps(result.token, {
                  totalApy: "totalApy" in result ? result.totalApy : undefined,
                })}
                key={index}
              />
            )
          })}
      </>
    )
  },
}
