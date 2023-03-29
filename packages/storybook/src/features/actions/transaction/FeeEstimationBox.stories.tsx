import { FeeEstimationBox } from "@argent-x/extension/src/ui/features/actions/feeEstimation/ui/FeeEstimationBox"
import { ComponentMeta, ComponentStory } from "@storybook/react"

export default {
  title: "features/FeeEstimationBox",
  component: FeeEstimationBox,
} as ComponentMeta<typeof FeeEstimationBox>

const Template: ComponentStory<typeof FeeEstimationBox> = (props) => (
  <FeeEstimationBox {...props} />
)

const tooltipText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor."

const wrap = {
  primaryText: "≈ 0.000000000000021 ETH",
  secondaryText: "(Max 0.000000000000063 ETH)",
}

const noWrap = {
  primaryText: "≈ 0.00021 ETH",
  secondaryText: "(Max 0.00063 ETH)",
}

export const Default = Template.bind({})
Default.args = {}

export const Loading = Template.bind({})
Loading.args = {
  isLoading: true,
}

export const NoWrap = Template.bind({})
NoWrap.args = {
  ...noWrap,
  tooltipText,
}

export const Wrap = Template.bind({})
Wrap.args = {
  ...wrap,
  tooltipText,
}

export const CombinedNoWrap = Template.bind({})
CombinedNoWrap.args = {
  ...noWrap,
  tooltipText,
  title: "Network fees",
  subtitle: "Includes one-time activation fee",
}

export const CombinedWrap = Template.bind({})
CombinedWrap.args = {
  ...wrap,
  tooltipText,
  title: "Network fees",
  subtitle: "Includes one-time activation fee",
}
