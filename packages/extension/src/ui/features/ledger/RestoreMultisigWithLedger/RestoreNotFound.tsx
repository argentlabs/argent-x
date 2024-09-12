import { FC, useMemo } from "react"
import { ScreenLayout } from "../layout/ScreenLayout"
import { Box } from "@chakra-ui/react"
import { RestoreMultisigSidePanel } from "./RestoreMultisigSidePanel"
import { P2 } from "@argent/x-ui"
import { Text } from "@chakra-ui/react"
import { ActionButton } from "../../../components/FullScreenPage"

export const RestoreNotFound: FC<{
  currentStep: number
  totalSteps: number
  helpLink?: string
}> = ({ currentStep, totalSteps, helpLink }) => {
  const subtitle = useMemo(() => {
    return (
      <P2 color="neutrals.200">
        If you think this is a mistake, contact{" "}
        <Text as="span" color="primary.500">
          <a
            href="mailto:support@argent.xyz"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            support@argent.xyz
          </a>
        </Text>
      </P2>
    )
  }, [])

  return (
    <ScreenLayout
      title="No multisigs found"
      subtitle={subtitle}
      sidePanel={<RestoreMultisigSidePanel />}
      currentIndex={currentStep}
      length={totalSteps}
      helpLink={helpLink}
      filledIndicator
    >
      <Box mt="300px">
        <ActionButton onClick={window.close}>Finish</ActionButton>
      </Box>
    </ScreenLayout>
  )
}
