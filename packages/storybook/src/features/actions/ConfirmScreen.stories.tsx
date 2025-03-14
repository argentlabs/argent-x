import { ConfirmScreen } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { H4, ModalBottomDialog, P2, P3 } from "@argent/x-ui"
import { Center } from "@chakra-ui/layout"
import type { ComponentProps } from "react"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ConfirmScreen,
  decorators,
}

export const Default = {
  render: (props: ComponentProps<typeof ConfirmScreen>) => (
    <ConfirmScreen {...props}>
      <Center rounded={"md"} bg={"neutrals.600"} height={"800px"}>
        Some content in here
      </Center>
    </ConfirmScreen>
  ),
  args: {
    confirmButtonDisabled: false,
  },
}

export const ConfirmDestructive = {
  ...Default,
  args: {
    confirmButtonDisabled: false,
    destructive: true,
  },
}

export const WithFooter = {
  ...Default,
  args: {
    confirmButtonDisabled: false,
    footer: (
      <Center bg={"neutrals.500"} rounded={"base"} px={1} py={2}>
        <P3>Placeholder footer</P3>
      </Center>
    ),
  },
}

export const Ledger = {
  ...Default,
  args: {
    isLedger: true,
  },
}

export const WithModalBottomDialog = {
  ...Default,
  args: {
    footer: (
      <ModalBottomDialog isOpen onClose={() => {}}>
        <Center textAlign="center" flexDirection="column" gap={1}>
          <H4>Lorem ipsum</H4>
          <P2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus
            nisl, diam iaculis porttitor
          </P2>
        </Center>
      </ModalBottomDialog>
    ),
  },
}
