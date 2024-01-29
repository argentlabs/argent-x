import { AddNewAccountScreen } from "@argent-x/extension/src/ui/features/accounts/AddNewAccountScreen"
import {
  AccountType,
  AccountTypeId,
} from "@argent-x/extension/src/ui/features/accounts/AddNewAccountScreen"
import { icons } from "@argent/ui"

import { decorators } from "../../decorators/routerDecorators"

const { WalletIcon, MultisigIcon } = icons

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
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  args: {
    accountTypes,
    isAccountTypeLoading,
  },
}
