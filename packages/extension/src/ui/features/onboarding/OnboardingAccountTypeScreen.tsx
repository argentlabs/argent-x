import { useState } from "react"
import { AccountType, AccountTypeId } from "../accounts/AddNewAccountScreen"
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
}
const OnboardingAccountTypeScreen = (props: OnboardingAccountTypeProps) => {
  const {
    onBack,
    onAccountTypeConfirmed,
    currentIndex,
    length,
    accountTypes,
    isAccountTypeLoading,
  } = props

  const [selectedAccountTypeId, setSelectedAccountTypeId] =
    useState<AccountTypeId>(accountTypes[IS_DEV ? 1 : 0].id)

  return (
    <OnboardingScreen
      onBack={onBack}
      length={length ?? 5} // there are 5 steps in the onboarding process
      currentIndex={currentIndex ?? 3} // this is the 4th step
      title={"Choose account type"}
      subtitle="Which type of account would you like to create? You can always add additional accounts later"
    >
      <AccountTypesList
        accountTypes={accountTypes}
        isAccountTypeLoading={isAccountTypeLoading}
        selectedAccountTypeId={selectedAccountTypeId}
        setSelectedAccountTypeId={setSelectedAccountTypeId}
      />
      <Box>
        <OnboardingButton
          mt={12}
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

export default OnboardingAccountTypeScreen
