import { FundingQrCodeScreen } from "@argent-x/extension/src/ui/features/funding/FundingQrCodeScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: FundingQrCodeScreen,
  decorators,
}

export const Default = {
  args: {
    accountName: "Account 1",
    accountAddress:
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  },
}

export const ShortAddress = {
  args: {
    accountName: "Account 123",
    accountAddress: "0x123",
  },
}
