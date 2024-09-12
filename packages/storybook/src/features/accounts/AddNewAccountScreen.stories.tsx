import { AddNewAccountScreen } from "@argent-x/extension/src/ui/features/accounts/AddNewAccountScreen"
import {
  AccountType,
  AccountTypeId,
} from "@argent-x/extension/src/ui/features/accounts/AddNewAccountScreen"
import { iconsDeprecated } from "@argent/x-ui"

import { decorators } from "../../decorators/routerDecorators"

const { WalletIcon, MultisigIcon } = iconsDeprecated

const accountTypes: AccountType[] = [
  {
    id: AccountTypeId.STANDARD,
    type: "standard",
    title: "Standard Account",
    subtitle: "Create a new Argent X account",
    icon: <WalletIcon />,
  },
  {
    id: AccountTypeId.MULTISIG,
    type: "multisig",
    title: "Multisig Account",
    subtitle: "For multiple owners",
    icon: <MultisigIcon />,
  },
]

const isAccountTypeLoading = () => false

export default {
  component: AddNewAccountScreen,
  decorators,
}

export const Default = {
  args: {
    accountTypes,
    isAccountTypeLoading,
  },
}
