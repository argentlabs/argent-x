import { Option } from "@argent-x/extension/src/ui/components/Options"
import CardSvg from "@argent-x/extension/src/ui/features/funding/card.svg"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "components/Option",
  component: Option,
} as ComponentMeta<typeof Option>

const Template: ComponentStory<typeof Option> = (props) => (
  <Option {...props}></Option>
)

export const BuyWithCard = Template.bind({})
BuyWithCard.args = {
  title: "Buy with card or bank transfer",
  icon: <CardSvg />,
  hideArrow: true,
}
