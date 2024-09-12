import { FC } from "react"
import { ScreenLayout } from "../layout/ScreenLayout"
import { Box } from "@chakra-ui/react"
import { RestoreMultisigSidePanel } from "./RestoreMultisigSidePanel"
import { ActionButton } from "../../../components/FullScreenPage"

export const RestoreDetecting: FC<{
  currentStep: number
  totalSteps: number
  helpLink?: string
}> = ({ currentStep, totalSteps, helpLink }) => {
  return (
    <ScreenLayout
      title="Detecting and restoring multisigs..."
      subtitle="This could take a few minutes"
      sidePanel={<RestoreMultisigSidePanel />}
      currentIndex={currentStep}
      length={totalSteps}
      helpLink={helpLink}
      filledIndicator
    >
      <Box mt="300px">
        <ActionButton
          isLoading
          isDisabled
          bgColor="primary.orange.800"
          _disabled={{ opacity: "1" }}
          pointerEvents="none"
        />
      </Box>
    </ScreenLayout>
  )
}
