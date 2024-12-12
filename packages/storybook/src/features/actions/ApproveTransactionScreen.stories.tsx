import {
  aspect,
  jediswap,
  jediswapUnsafe,
  transfer,
} from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { ApproveTransactionScreen } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ApproveTransactionScreen"
import { P3 } from "@argent/x-ui"
import { Center } from "@chakra-ui/layout"

import { account } from "../../account"
import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ApproveTransactionScreen,
  decorators,
}

const footer = (
  <Center bg={"neutrals.500"} rounded={"base"} px={1} py={2}>
    <P3>Placeholder footer</P3>
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
