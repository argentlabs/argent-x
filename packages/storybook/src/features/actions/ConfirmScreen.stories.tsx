import { ConfirmScreen } from "@argent-x/extension/src/ui/features/actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { H5, ModalBottomDialog, P3, P4 } from "@argent/x-ui"
import { Center } from "@chakra-ui/layout"
import { ComponentProps } from "react"

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
        <P4>Placeholder footer</P4>
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
          <H5>Lorem ipsum</H5>
          <P3>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus
            nisl, diam iaculis porttitor
          </P3>
        </Center>
      </ModalBottomDialog>
    ),
  },
}
