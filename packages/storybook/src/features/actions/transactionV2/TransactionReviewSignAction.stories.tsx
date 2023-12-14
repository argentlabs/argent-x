import { dataToSign } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { unframedSignature } from "@argent-x/extension/src/ui/features/transactionReview/signature/fixtures"
import { TransactionReviewSignAction } from "@argent-x/extension/src/ui/features/actions/transactionV2/action/TransactionReviewSignAction"

import { decorators } from "../../../decorators/routerDecorators"

export default {
  component: TransactionReviewSignAction,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    dataToSign,
  },
}

export const Unframed = {
  args: {
    dataToSign: unframedSignature,
  },
}
