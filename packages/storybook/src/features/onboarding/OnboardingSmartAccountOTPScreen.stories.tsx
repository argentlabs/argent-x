import { Meta, StoryObj } from "@storybook/react"
import { OnboardingSmartAccountOTPScreen } from "@argent-x/extension/src/ui/features/onboarding/OnboardingSmartAccountOTPScreen"

const meta: Meta<typeof OnboardingSmartAccountOTPScreen> = {
  component: OnboardingSmartAccountOTPScreen,
}

export default meta

type Story = StoryObj<typeof OnboardingSmartAccountOTPScreen>

export const Default: Story = {
  args: {
    email: "test@test.com",
    setSmartAccountValidationError: () => {},
  },
}
