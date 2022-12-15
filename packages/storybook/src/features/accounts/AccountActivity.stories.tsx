import { AccountActivity } from "@argent-x/extension/src/ui/features/accountActivity/AccountActivity"
import { DailyActivity } from "@argent-x/extension/src/ui/features/accountActivity/useActivity"
import { Account } from "@argent-x/extension/src/ui/features/accounts/Account"
import { CellStack } from "@argent/ui"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { account } from "../../account"
import { tokensByNetwork } from "../../tokensByNetwork"
import activity from "./__fixtures__/transactions.json"

export default {
  title: "accounts/AccountActivity",
  component: AccountActivity,
} as ComponentMeta<typeof AccountActivity>

const Template: ComponentStory<typeof AccountActivity> = (props) => (
  <MemoryRouter initialEntries={["/"]}>
    <CellStack>
      <AccountActivity {...props}></AccountActivity>
    </CellStack>
  </MemoryRouter>
)

export const Default = Template.bind({})
Default.args = {
  activity: activity as DailyActivity,
  account: account as Account,
  tokensByNetwork,
}
