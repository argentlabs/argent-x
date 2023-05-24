import { AccountListScreenItem } from "@argent-x/extension/src/ui/features/accounts/AccountListScreenItem"
import { CellStack } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: AccountListScreenItem,
  parameters: {
    layout: "fullscreen",
  },
}

const account = {
  accountName: "Account 1 Lorem Ipsum Dolor Sit Amet",
  accountAddress:
    "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  networkId: "goerli-alpha",
}

export const Default = {
  render: (props: ComponentProps<typeof AccountListScreenItem>) => (
    <CellStack>
      <AccountListScreenItem {...props}></AccountListScreenItem>
    </CellStack>
  ),
  args: {
    ...account,
  },
}

export const ClickNavigateSettings = {
  ...Default,
  args: {
    ...account,
    clickNavigateSettings: true,
  },
}
