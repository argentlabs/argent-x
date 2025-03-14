import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingPrivacyScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingPrivacyScreen"

const meta: Meta<typeof OnboardingPrivacyScreen> = {
  component: OnboardingPrivacyScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingPrivacyScreen>

export const Default: Story = {
  args: {},
}
