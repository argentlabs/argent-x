import { ApproveTransactionScreen } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ApproveTransactionScreen"
import { P4 } from "@argent/ui"
import { Center } from "@chakra-ui/layout"

import { account } from "../../account"
import { decorators } from "../../decorators/routerDecorators"
import aspect from "./__fixtures__/aspect"
import jediswap from "./__fixtures__/jediswap"
import transfer from "./__fixtures__/transfer"

export default {
  component: ApproveTransactionScreen,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

const footer = (
  <Center bg={"neutrals.500"} rounded={"base"} px={1} py={2}>
    <P4>Placeholder footer</P4>
  </Center>
)

export const Jediswap = {
  args: {
    ...jediswap,
    disableConfirm: true,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const JediswapUnsafe = {
  args: {
    ...jediswap,
    aggregatedData: jediswap.aggregatedData.map((data) => ({
      ...data,
      safe: false,
    })),
    disableConfirm: true,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const Transfer = {
  args: {
    ...transfer,
    disableConfirm: true,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const Aspect = {
  args: {
    ...aspect,
    disableConfirm: true,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}
