import { Meta, StoryObj } from "@storybook/react"

import {
  DefiPosition,
  DefiPositionProps,
} from "@argent-x/extension/src/ui/features/defi/defiDecomposition/DefiPosition"
import { storybookCellStackDecorator } from "@argent/x-ui"
import { ArgentDbDecorator } from "../../decorators/db/argentDbDecorator"
import { parsedPositionsWithUsdValue } from "./__fixtures__/parsedDefiDecompositionWithUsdValue"
import {
  isCollateralizedDebtPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
} from "@argent-x/extension/src/shared/defiDecomposition/schema"

const meta: Meta<typeof DefiPosition> = {
  component: DefiPosition,
  decorators: [storybookCellStackDecorator, ArgentDbDecorator],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj<typeof DefiPosition>

const Default = {
  args: {
    networkId: "mainnet-alpha",
  },
}

const positions = parsedPositionsWithUsdValue.flatMap((dapp) => {
  return dapp.products.flatMap((product) => {
    return product.positions
  })
})

function makeProps(position: object, overrides?: object) {
  const props = {
    position,
    ...overrides,
  } as unknown as DefiPositionProps
  return props
}

export const Positions = {
  render: () => {
    return (
      <>
        {Object.values(positions).map((position, index) => {
          return (
            <DefiPosition
              {...makeProps(position)}
              {...Default.args}
              key={index}
            />
          )
        })}
      </>
    )
  },
}

export const ConcentratedLiquidity: Story = {
  render: () => {
    return (
      <>
        {Object.values(positions)
          .filter((p) => isConcentratedLiquidityPosition(p))
          .map((position, index) => {
            return (
              <DefiPosition
                {...makeProps(position)}
                {...Default.args}
                key={index}
              />
            )
          })}
      </>
    )
  },
}

export const CollateralizedDebt: Story = {
  render: () => {
    return (
      <>
        {Object.values(positions)
          .filter((p) => isCollateralizedDebtPosition(p))
          .map((position, index) => {
            return (
              <DefiPosition
                {...makeProps(position)}
                {...Default.args}
                key={index}
              />
            )
          })}
      </>
    )
  },
}

export const DelegatedTokens: Story = {
  render: () => {
    return (
      <>
        {Object.values(positions)
          .filter((p) => isDelegatedTokensPosition(p))
          .map((position, index) => {
            return (
              <DefiPosition
                {...makeProps(position)}
                {...Default.args}
                key={index}
              />
            )
          })}
      </>
    )
  },
}

export const Staking: Story = {
  render: () => {
    return (
      <>
        {Object.values(positions)
          .filter((p) => isStakingPosition(p))
          .map((position, index) => {
            return (
              <DefiPosition
                {...makeProps(position)}
                {...Default.args}
                key={index}
              />
            )
          })}
      </>
    )
  },
}
