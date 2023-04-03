import { CombinedFeeEstimation } from "@argent-x/extension/src/ui/features/actions/feeEstimation/CombinedFeeEstimation"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import {
  combinedFeeEstimationFixture1,
  combinedFeeEstimationFixture2,
  combinedFeeEstimationFixture3,
  combinedFeeEstimationFixture4,
  combinedFeeEstimationFixture5,
} from "./__fixtures__/fees/combinedFeeEstimationFixtures"

export default {
  title: "features/CombinedFeeEstimation",
  component: CombinedFeeEstimation,
} as ComponentMeta<typeof CombinedFeeEstimation>

const Template: ComponentStory<typeof CombinedFeeEstimation> = (props) => (
  <CombinedFeeEstimation {...props} />
)

export const Scenario1 = Template.bind({})
Scenario1.args = {
  ...combinedFeeEstimationFixture1,
}

export const Scenario2 = Template.bind({})
Scenario2.args = {
  ...combinedFeeEstimationFixture2,
}

export const Scenario3 = Template.bind({})
Scenario3.args = {
  ...combinedFeeEstimationFixture3,
}

export const Scenario4 = Template.bind({})
Scenario4.args = {
  ...combinedFeeEstimationFixture4,
}

export const Scenario5 = Template.bind({})
Scenario5.args = {
  ...combinedFeeEstimationFixture5,
}
