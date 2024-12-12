import type { FC } from "react"
import { useState } from "react"
import type { AccountType } from "../accounts/AddNewAccountScreen"
import { AccountTypeId } from "../accounts/AddNewAccountScreen"
import { AccountTypesList } from "../accounts/ui/AccountTypesList"
import { OnboardingScreen } from "./ui/OnboardingScreen"
import { Box } from "@chakra-ui/react"
import { isDirty } from "zod"
import { OnboardingButton } from "./ui/OnboardingButton"
import { IS_DEV } from "../../../shared/utils/dev"

interface OnboardingAccountTypeProps {
  onBack?: () => void
  currentIndex?: number
  length?: number
  accountTypes: AccountType[]
  isAccountTypeLoading: (id: AccountTypeId) => boolean
  onAccountTypeConfirmed: (id: AccountTypeId) => void
  isSmartAccountSelected?: boolean
}

export const OnboardingAccountTypeScreen: FC<OnboardingAccountTypeProps> = ({
  onBack,
  onAccountTypeConfirmed,
  currentIndex,
  length,
  accountTypes,
  isAccountTypeLoading,
}) => {
  const [selectedAccountTypeId, setSelectedAccountTypeId] =
    useState<AccountTypeId>(accountTypes[IS_DEV ? 1 : 0].id)

  const isSmart = selectedAccountTypeId === AccountTypeId.SMART_ACCOUNT

  return (
    <OnboardingScreen
      onBack={onBack}
      length={length ?? 5} // there are 5 steps in the onboarding process
      currentIndex={currentIndex ?? 3} // this is the 4th step
      title={"Choose your first account"}
      subtitle="Pick an account type which best suits your needs. You can change this later at any time"
      illustration={isSmart ? "account-smart" : "account-standard"}
    >
      <AccountTypesList
        accountTypes={accountTypes}
        isAccountTypeLoading={isAccountTypeLoading}
        selectedAccountTypeId={selectedAccountTypeId}
        setSelectedAccountTypeId={setSelectedAccountTypeId}
      />
      <Box>
        <OnboardingButton
          mt={15}
          type="submit"
          isDisabled={!isDirty || isAccountTypeLoading(selectedAccountTypeId)}
          onClick={() => onAccountTypeConfirmed(selectedAccountTypeId)}
        >
          Continue
        </OnboardingButton>
      </Box>
    </OnboardingScreen>
  )
}
