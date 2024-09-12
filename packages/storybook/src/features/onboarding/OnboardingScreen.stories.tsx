import { OnboardingScreen } from "@argent-x/extension/src/ui/features/onboarding/ui/OnboardingScreen"
import { logosDeprecated } from "@argent/x-ui"

const { ArgentXLogo } = logosDeprecated

export default {
  component: OnboardingScreen,
}

export const Default = {
  args: {
    title: "Title lorem ipsum",
    subtitle: "Subtitle dolor sit amet",
    length: 10,
    currentIndex: 3,
    icon: <ArgentXLogo />,
  },
}
