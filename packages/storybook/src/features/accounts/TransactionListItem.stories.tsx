import { TransactionListItem } from "@argent-x/extension/src/ui/features/accountActivity/TransactionListItem"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "accounts/TransactionListItem",
  component: TransactionListItem,
} as ComponentMeta<typeof TransactionListItem>

const Template: ComponentStory<typeof TransactionListItem> = (props) => (
  <TransactionListItem {...props}></TransactionListItem>
)

const meta = {
  subTitle: "Lorem ipsum dolor",
}

export const Default = Template.bind({})
Default.args = {
  hash: "0xb7572612045a9c28277f0265499f78f9a549c34a1b5591598cce34d0cc042d",
  status: "transparent",
  meta,
}

export const Rejected = Template.bind({})
Rejected.args = {
  hash: "0xb7572612045a9c28277f0265499f78f9a549c34a1b5591598cce34d0cc042d",
  status: "red",
  meta,
}

export const Pending = Template.bind({})
Pending.args = {
  hash: "0xb7572612045a9c28277f0265499f78f9a549c34a1b5591598cce34d0cc042d",
  status: "orange",
  highlighted: true,
  showExternalOpenIcon: true,
  meta: {
    title: "Transfer",
  },
}
