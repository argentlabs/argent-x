import { AccountListItemSkeleton } from "@argent-x/extension/src/ui/features/accounts/AccountListItemSkeleton"
import { CellStack } from "@argent/ui"
import { ComponentProps } from "react"

export default {
  component: AccountListItemSkeleton,
  parameters: {
    layout: "fullscreen",
  },
  render: (props: ComponentProps<typeof AccountListItemSkeleton>) => (
    <CellStack>
      <AccountListItemSkeleton {...props}></AccountListItemSkeleton>
    </CellStack>
  ),
}

export const Default = {
  args: {},
}
