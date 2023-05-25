import { CopyIconButton } from "@argent-x/extension/src/ui/components/CopyIconButton"

export default {
  component: CopyIconButton,
}

export const IconAndText = {
  args: {
    copyValue: "Will be copied to clipboard",
    children: <>Some content in here</>,
  },
}

export const IconOnly = {
  args: {
    copyValue: "Will be copied to clipboard",
  },
}
