import { dataToSign } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { ApproveSignatureScreen } from "@argent-x/extension/src/ui/features/actions/ApproveSignatureScreen"

import { decorators } from "../../decorators/routerDecorators"

export default {
  component: ApproveSignatureScreen,
  decorators,
}

export const Default = {
  args: {
    dataToSign,
  },
}
