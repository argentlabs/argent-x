import { LoadingScreen } from "@argent-x/extension/src/ui/features/actions/LoadingScreen"

export default {
  component: LoadingScreen,
}

export const Default = {
  args: {},
}

export const Progress = {
  args: {
    progress: 0.67,
  },
}
