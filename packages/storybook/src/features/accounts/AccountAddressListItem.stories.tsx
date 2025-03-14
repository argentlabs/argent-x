import { AccountAddressListItem } from "@argent-x/extension/src/ui/features/accounts/AccountAddressListItem"
import { CellStack } from "@argent/x-ui"
import type { ComponentProps } from "react"

export default {
  component: AccountAddressListItem,
  render: (props: ComponentProps<typeof AccountAddressListItem>) => (
    <CellStack>
      <AccountAddressListItem {...props}></AccountAddressListItem>
    </CellStack>
  ),
}

export const Default = {
  args: {
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}

export const DefaultTruncated = {
  args: {
    ...Default.args,
    truncated: true,
  },
}

export const StarknetID = {
  args: {
    accountAddress: "foobar.stark",
  },
}

export const StarknetIDTruncated = {
  args: {
    ...StarknetID.args,
    truncated: true,
  },
}
