import { ApproveTransaction } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen"
import { P4 } from "@argent/ui"
import { Center } from "@chakra-ui/layout"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { account } from "../../account"
import aspect from "./__fixtures__/aspect.json"
import jediswap from "./__fixtures__/jediswap.json"
import transfer from "./__fixtures__/transfer.json"

export default {
  title: "features/ApproveTransaction",
  parameters: {
    layout: "fullscreen",
  },
  component: ApproveTransaction,
} as ComponentMeta<typeof ApproveTransaction>

const Template: ComponentStory<typeof ApproveTransaction> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <ApproveTransaction {...props} />
  </MemoryRouter>
)

const onSubmit = (args: any) => console.log("onSubmit", args)

const footer = (
  <Center bg={"neutrals.500"} rounded={"base"} px={1} py={2}>
    <P4>Placeholder footer</P4>
  </Center>
)

export const Jediswap = Template.bind({})
Jediswap.args = {
  ...jediswap,
  disableConfirm: true,
  isMainnet: true,
  isSimulationLoading: false,
  selectedAccount: account,
  onSubmit,
  footer,
} as any

export const JediswapUnsafe = Template.bind({})
JediswapUnsafe.args = {
  ...jediswap,
  aggregatedData: jediswap.aggregatedData.map((data) => ({
    ...data,
    safe: false,
  })),
  disableConfirm: true,
  isMainnet: true,
  isSimulationLoading: false,
  selectedAccount: account,
  onSubmit,
  footer,
} as any

export const Transfer = Template.bind({})
Transfer.args = {
  ...transfer,
  disableConfirm: true,
  isMainnet: true,
  isSimulationLoading: false,
  selectedAccount: account,
  onSubmit,
  footer,
} as any

export const Aspect = Template.bind({})
Aspect.args = {
  ...aspect,
  disableConfirm: true,
  isMainnet: true,
  isSimulationLoading: false,
  selectedAccount: account,
  onSubmit,
  footer,
} as any
