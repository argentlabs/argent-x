import { FeeEstimation } from "@argent-x/extension/src/ui/features/actions/feeEstimation/FeeEstimation"
import { ComponentMeta, ComponentStory } from "@storybook/react"

import {
  feeEstimationFixture1,
  feeEstimationFixture2,
  feeEstimationFixture3,
  feeEstimationFixture4,
  feeEstimationFixture5,
} from "./__fixtures__/fees/feeEstimationFixtures"

export default {
  title: "features/FeeEstimation",
  component: FeeEstimation,
} as ComponentMeta<typeof FeeEstimation>

const Template: ComponentStory<typeof FeeEstimation> = (props) => (
  <FeeEstimation {...props} />
)

export const Scenario1 = Template.bind({})
Scenario1.args = {
  ...feeEstimationFixture1,
}

export const Scenario2 = Template.bind({})
Scenario2.args = {
  ...feeEstimationFixture2,
}

export const Scenario3 = Template.bind({})
Scenario3.args = {
  ...feeEstimationFixture3,
}

export const Scenario4 = Template.bind({})
Scenario4.args = {
  ...feeEstimationFixture4,
}

export const Scenario5 = Template.bind({})
Scenario5.args = {
  ...feeEstimationFixture5,
}
