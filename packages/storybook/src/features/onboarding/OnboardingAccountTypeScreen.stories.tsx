import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingAccountTypeScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingAccountTypeScreen"
import { getAccountTypesForOnboarding } from "@argent-x/extension/src/ui/features/accounts/useAccountTypesForNetwork"
import { defaultNetwork } from "@argent-x/extension/src/shared/network"

const meta: Meta<typeof OnboardingAccountTypeScreen> = {
  component: OnboardingAccountTypeScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingAccountTypeScreen>

export const Default: Story = {
  args: {
    accountTypes: getAccountTypesForOnboarding(defaultNetwork),
    isAccountTypeLoading: () => false,
  },
}
