import type { Meta, StoryObj } from "@storybook/react"
import { OnboardingSmartAccountEmailScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingSmartAccountEmailScreen"

const meta: Meta<typeof OnboardingSmartAccountEmailScreen> = {
  component: OnboardingSmartAccountEmailScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingSmartAccountEmailScreen>

export const Default: Story = {
  args: {
    onBack: () => {},
    onSubmit: () => {},
  },
}
