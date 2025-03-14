import type { Meta, StoryObj } from "@storybook/react"

import type { ParsedPosition } from "@argent-x/extension/src/shared/defiDecomposition/schema"
import {
  isCollateralizedDebtPosition,
  isConcentratedLiquidityPosition,
  isDelegatedTokensPosition,
  isStakingPosition,
  isStrkDelegatedStakingPosition,
} from "@argent-x/extension/src/shared/defiDecomposition/schema"
import type { DefiIconProps } from "@argent-x/extension/src/ui/features/defi/defiDecomposition/DefiIcon"
import { DefiIcon } from "@argent-x/extension/src/ui/features/defi/defiDecomposition/DefiIcon"
import { storybookCellStackDecorator } from "@argent/x-ui"
import { parsedDefiDecomposition } from "./__fixtures__/parsedDefiDecomposition"

const meta: Meta<typeof DefiIcon> = {
  component: DefiIcon,
  decorators: [storybookCellStackDecorator],
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj<typeof DefiIcon>

const Default = {
  args: {
    networkId: "mainnet-alpha",
  },
}

const positions: ParsedPosition[] = parsedDefiDecomposition.flatMap((dapp) => {
  return dapp.products.flatMap((product) => {
    return product.positions
  })
})

function makeProps(position: object, overrides?: object) {
  const props = {
    position,
    ...overrides,
  } as unknown as DefiIconProps
  return props
}

export const Positions = {
  render: () => {
    return (
      <>
        {Object.values(positions).map((position, index) => {
          return (
            <DefiIcon {...makeProps(position)} {...Default.args} key={index} />
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
              <DefiIcon
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
              <DefiIcon
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
              <DefiIcon
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
              <DefiIcon
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

export const StrkDelegatedStakingIcon: Story = {
  render: () => {
    return (
      <>
        {Object.values(positions)
          .filter((p) => isStrkDelegatedStakingPosition(p))
          .map((position, index) => {
            return (
              <DefiIcon
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
