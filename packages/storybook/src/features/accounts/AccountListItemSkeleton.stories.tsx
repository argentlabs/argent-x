import { AccountListItemSkeleton } from "@argent-x/extension/src/ui/features/accounts/AccountListItemSkeleton"
import { CellStack } from "@argent/x-ui"
import type { ComponentProps } from "react"

export default {
  component: AccountListItemSkeleton,
  render: (props: ComponentProps<typeof AccountListItemSkeleton>) => (
    <CellStack>
      <AccountListItemSkeleton {...props}></AccountListItemSkeleton>
    </CellStack>
  ),
}

export const Default = {
  args: {},
}
