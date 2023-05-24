import { CombinedFeeEstimation } from "@argent-x/extension/src/ui/features/actions/feeEstimation/CombinedFeeEstimation"

import {
  combinedFeeEstimationFixture1,
  combinedFeeEstimationFixture2,
  combinedFeeEstimationFixture3,
  combinedFeeEstimationFixture4,
  combinedFeeEstimationFixture5,
} from "./__fixtures__/fees/combinedFeeEstimationFixtures"

export default {
  component: CombinedFeeEstimation,
}

export const Scenario1 = {
  args: {
    ...combinedFeeEstimationFixture1,
  },
}

export const Scenario2 = {
  args: {
    ...combinedFeeEstimationFixture2,
  },
}

export const Scenario3 = {
  args: {
    ...combinedFeeEstimationFixture3,
  },
}

export const Scenario4 = {
  args: {
    ...combinedFeeEstimationFixture4,
  },
}

export const Scenario5 = {
  args: {
    ...combinedFeeEstimationFixture5,
  },
}
