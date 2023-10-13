import {
  aspect,
  jediswap,
  jediswapUnsafe,
  transfer,
} from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { ApproveTransactionScreen } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ApproveTransactionScreen"
import { P4 } from "@argent/ui"
import { Center } from "@chakra-ui/layout"

import { account } from "../../account"
import { decorators } from "../../decorators/routerDecorators"

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
    disableConfirm: false,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const JediswapUnsafe = {
  args: {
    ...jediswapUnsafe,
    disableConfirm: false,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const Transfer = {
  args: {
    ...transfer,
    disableConfirm: false,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const Aspect = {
  args: {
    ...aspect,
    disableConfirm: false,
    isMainnet: true,
    isSimulationLoading: false,
    selectedAccount: account,
    footer,
  } as any,
}

export const AspectIsApproving = {
  args: {
    ...Aspect.args,
    actionIsApproving: true,
  } as any,
}

export const AspectErrorApproving = {
  args: {
    ...Aspect.args,
    actionErrorApproving: "Lorem ipsum dolor sit amet",
  } as any,
}
