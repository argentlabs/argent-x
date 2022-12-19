import { TransactionActions } from "@argent-x/extension/src/ui/features/actions/transaction/TransactionActions"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Call } from "starknet"

export default {
  title: "features/TransactionsActions",
  component: TransactionActions,
} as ComponentMeta<typeof TransactionActions>

const frenslandCalls: Call[] = [
  {
    entrypoint: "Start Game",
    contractAddress:
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
  },
  {
    entrypoint: "Harvest",
    calldata: ["76", "0", "23", "6"],
    contractAddress:
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
  },
  {
    entrypoint: "Repair building",
    calldata: [
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
      "0",
      "24",
      "5",
    ],
    contractAddress:
      "0x0274f30014f7456d36b82728eb655f23dfe9ef0b7e0c6ca827052ab2d01a5d65",
  },
]

const Template: ComponentStory<typeof TransactionActions> = (props) => (
  <TransactionActions {...props} />
)

export const FrensLand = Template.bind({})
FrensLand.args = {
  transactions: frenslandCalls,
}
