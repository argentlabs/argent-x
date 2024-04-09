import { SignActionScreenV2 } from "@argent-x/extension/src/ui/features/actions/transactionV2/SignActionScreenV2"
import { unframedSignature } from "@argent-x/extension/src/ui/features/transactionReview/signature/fixtures"

import { decorators } from "../../../decorators/routerDecorators"

export default {
  component: SignActionScreenV2,
  decorators,
}

export const Default = {
  args: {
    dataToSign: unframedSignature,
  },
}

export const Dapp = {
  args: {
    ...Default.args,
    subtitle: "https://game-goerli.influenceth.io",
    dappHost: "https://game-goerli.influenceth.io",
    dappLogoUrl:
      "https://www.google.com/s2/favicons?sz=64&domain=https://game-goerli.influenceth.io",
  },
}
