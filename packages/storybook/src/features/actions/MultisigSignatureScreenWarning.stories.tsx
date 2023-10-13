import { dataToSign } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import { MultisigSignatureScreenWarning } from "@argent-x/extension/src/ui/features/multisig/MultisigSignatureScreenWarning"

import { decorators } from "../../decorators/routerDecorators"
import { account } from "../../account"

export default {
  component: MultisigSignatureScreenWarning,
  decorators,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    ...dataToSign,
    selectedAccount: { ...account, name: "Multisig 1" },
  },
}
