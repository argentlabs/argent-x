import { AccountActivity } from "@argent-x/extension/src/ui/features/accountActivity/AccountActivity"
import { DailyActivity } from "@argent-x/extension/src/ui/features/accountActivity/useActivity"
import { Account } from "@argent-x/extension/src/ui/features/accounts/Account"
import { CellStack } from "@argent/x-ui"
import { ComponentProps } from "react"

import { account } from "../../account"
import { decorators } from "../../decorators/routerDecorators"
import { tokensByNetwork } from "../../tokens"
import activity from "./__fixtures__/transactions.json"

export default {
  component: AccountActivity,
  decorators,
}

export const Default = {
  render: (props: ComponentProps<typeof AccountActivity>) => (
    <CellStack>
      <AccountActivity {...props}></AccountActivity>
    </CellStack>
  ),
  args: {
    activity: activity as DailyActivity,
    account: account as unknown as Account,
    tokensByNetwork,
  },
}
