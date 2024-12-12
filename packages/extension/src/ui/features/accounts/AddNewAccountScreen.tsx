import { BarCloseButton, NavigationContainer } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"
import { useState } from "react"

import type { WalletAccountType } from "../../../shared/wallet.model"
import { AccountTypesList } from "./ui/AccountTypesList"
import { ConfirmScreen } from "../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { IS_DEV } from "../../../shared/utils/dev"

export enum AccountTypeId {
  STANDARD,
  MULTISIG,
  STANDARD_CAIRO_0,
  SMART_ACCOUNT,
  LEDGER,
  IMPORTED,
}

export interface AccountType {
  id: AccountTypeId
  type: WalletAccountType
  title: string
  subtitle?: string | React.ReactNode
  label?: string
  detailedDescription?: React.ReactNode
  icon?: React.ReactNode
  disabledText?: string
}

interface AddNewAccountScreenProps {
  onClose: ReactEventHandler
  accountTypes: AccountType[]
  isAccountTypeLoading: (id: AccountTypeId) => boolean
  isAccountTypeDisabled?: (id: AccountTypeId) => boolean
  onAccountTypeConfirmed: (id: AccountTypeId) => void
}

export const AddNewAccountScreen: FC<AddNewAccountScreenProps> = ({
  onClose,
  accountTypes,
  isAccountTypeLoading,
  isAccountTypeDisabled,
  onAccountTypeConfirmed,
}) => {
  const [selectedAccountTypeId, setSelectedAccountTypeId] =
    useState<AccountTypeId>(accountTypes[IS_DEV ? 1 : 0].id)

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={onClose} />}
      title="Add a new account"
    >
      <ConfirmScreen
        title="Select account type"
        confirmButtonText="Continue"
        singleButton
        onSubmit={() => onAccountTypeConfirmed(selectedAccountTypeId)}
      >
        <AccountTypesList
          accountTypes={accountTypes}
          isAccountTypeLoading={isAccountTypeLoading}
          isAccountTypeDisabled={isAccountTypeDisabled}
          selectedAccountTypeId={selectedAccountTypeId}
          setSelectedAccountTypeId={setSelectedAccountTypeId}
        />
      </ConfirmScreen>
    </NavigationContainer>
  )
}
