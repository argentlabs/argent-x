import { CombinedFeeEstimation } from "@argent-x/extension/src/ui/features/actions/feeEstimation/CombinedFeeEstimation"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import {
  combinedFeeEstimationFixture1,
  combinedFeeEstimationFixture2,
  combinedFeeEstimationFixture3,
  combinedFeeEstimationFixture4,
} from "./__fixtures__/fees/combinedFeeEstimationFixtures"

export default {
  title: "features/CombinedFeeEstimation",
  component: CombinedFeeEstimation,
} as ComponentMeta<typeof CombinedFeeEstimation>

const Template: ComponentStory<typeof CombinedFeeEstimation> = (props) => (
  <CombinedFeeEstimation {...props} />
)

export const NoWrap = Template.bind({})
NoWrap.args = {
  ...combinedFeeEstimationFixture2,
}

export const Wrap = Template.bind({})
Wrap.args = {
  ...combinedFeeEstimationFixture4,
}

export const Error = Template.bind({})
Error.args = {
  ...combinedFeeEstimationFixture1,
}

export const Loading = Template.bind({})
Loading.args = {
  ...combinedFeeEstimationFixture3,
}
