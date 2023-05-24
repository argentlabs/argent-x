import { Button, CopyTooltip } from "@argent/ui"

export default {
  component: CopyTooltip,
}

export const Default = {
  args: {
    message: "Copied",
    copyValue: "Will be copied to clipboard",
    children: <Button>Some content in here</Button>,
  },
}
