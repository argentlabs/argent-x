import { AddNewAccountScreen } from "@argent-x/extension/src/ui/features/accounts/AddNewAccountScreen"
import {
  getAccountTypesForNetwork,
  getAccountTypesForOnboarding,
} from "@argent-x/extension/src/ui/features/accounts/useAccountTypesForNetwork"
import { defaultNetwork } from "@argent-x/extension/src/shared/network"

import { decorators } from "../../decorators/routerDecorators"

const isAccountTypeLoading = () => false

export default {
  component: AddNewAccountScreen,
  decorators,
}

export const Default = {
  args: {
    accountTypes: getAccountTypesForNetwork(defaultNetwork),
    isAccountTypeLoading,
  },
}

export const Onboarding = {
  args: {
    accountTypes: getAccountTypesForOnboarding(defaultNetwork),
    isAccountTypeLoading,
  },
}
