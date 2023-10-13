import {
  feeEstimationFixture1,
  feeEstimationFixture2,
  feeEstimationFixture3,
  feeEstimationFixture4,
  feeEstimationFixture5,
} from "@argent-x/extension/src/ui/features/actions/feeEstimation/__fixtures__"
import { FeeEstimation } from "@argent-x/extension/src/ui/features/actions/feeEstimation/FeeEstimation"

export default {
  component: FeeEstimation,
}

export const Scenario1 = {
  args: {
    ...feeEstimationFixture1,
  },
}

export const Scenario2 = {
  args: {
    ...feeEstimationFixture2,
  },
}

export const Scenario3 = {
  args: {
    ...feeEstimationFixture3,
  },
}

export const Scenario4 = {
  args: {
    ...feeEstimationFixture4,
  },
}

export const Scenario5 = {
  args: {
    ...feeEstimationFixture5,
  },
}
