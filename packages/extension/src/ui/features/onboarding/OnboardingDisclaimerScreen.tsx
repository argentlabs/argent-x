import { B3 } from "@argent/ui"
import { Box, useCheckboxGroup } from "@chakra-ui/react"
import { FC, MouseEventHandler } from "react"

import { OnboardingButton } from "./ui/OnboardingButton"
import { OnboardingCheckbox } from "./ui/OnboardingCheckbox"
import { OnboardingScreen } from "./ui/OnboardingScreen"

interface OnboardingDisclaimerScreenProps {
  onBack?: MouseEventHandler
  onContinue: MouseEventHandler
  onPrivacy: MouseEventHandler
}

export const OnboardingDisclaimerScreen: FC<
  OnboardingDisclaimerScreenProps
> = ({ onContinue, onPrivacy, onBack }) => {
  const { value, getCheckboxProps } = useCheckboxGroup({
    defaultValue: [],
  })

  return (
    <OnboardingScreen
      length={4}
      currentIndex={1}
      title="Disclaimer"
      subtitle="StarkNet is in Alpha and may experience technical issues or introduce breaking changes from time to time. Please accept this before continuing."
      onBack={onBack}
    >
      <OnboardingCheckbox {...getCheckboxProps({ value: "lossOfFunds" })}>
        I understand that StarkNet may introduce changes that make my existing
        account unusable and force to create new ones.
      </OnboardingCheckbox>
      <OnboardingCheckbox {...getCheckboxProps({ value: "alphaVersion" })}>
        I understand that StarkNet may experience performance issues and my
        transactions may fail for various reasons.
      </OnboardingCheckbox>
      <B3
        color={"neutrals.500"}
        textDecoration={"underline"}
        display={"flex"}
        marginLeft={"auto"}
        textAlign={"right"}
        onClick={onPrivacy}
        cursor={"pointer"}
        mt={2}
        role="link"
      >
        Privacy statement
      </B3>
      <Box>
        <OnboardingButton isDisabled={value.length !== 2} onClick={onContinue}>
          Continue
        </OnboardingButton>
      </Box>
    </OnboardingScreen>
  )
}
