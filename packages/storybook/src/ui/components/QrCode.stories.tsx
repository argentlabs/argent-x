import { QrCode } from "@argent-x/extension/src/ui/components/QrCode"

export default {
  component: QrCode,
}

export const Default = {
  args: {
    size: 200,
    data: "0x123",
  },
}
