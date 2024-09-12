import {
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
} from "@argent-x/extension/src/shared/errors/argentAccount"
import { SmartAccountValidationErrorScreen } from "@argent-x/extension/src/ui/features/smartAccount/SmartAccountValidationErrorScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: SmartAccountValidationErrorScreen,
  decorators,
}

export const Scenario1 = {
  args: {
    error: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  },
}

export const Scenario2 = {
  args: {
    error: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  },
}

export const Scenario3 = {
  args: {
    error: SMART_ACCOUNT_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
  },
}
