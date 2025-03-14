import { SuccessSecondaryIcon } from "@argent/x-ui/icons"
import { MassiveTitle } from "@argent/x-ui"
import { Box, HStack } from "@chakra-ui/react"
import type { FC } from "react"
import { ActionButton } from "../../components/FullScreenPage"
import { SidePanel } from "./layout/Panel"
import { ScreenLayout } from "./layout/ScreenLayout"

export const LedgerReconnectSuccess: FC<{
  index: number
  totalSteps: number
  helpLink: string
  filledIndicator?: boolean
}> = ({ index, totalSteps, helpLink, filledIndicator }) => {
  const handleFinish = () => {
    window.close()
  }

  return (
    <ScreenLayout
      subtitle="Your Ledger has been successfully connected"
      currentIndex={index}
      title={
        <HStack>
          <MassiveTitle>Ledger connected</MassiveTitle>
          <SuccessSecondaryIcon color="success.500" ml="1" h={8} w={8} />
        </HStack>
      }
      back={false}
      length={totalSteps}
      filledIndicator={filledIndicator}
      sidePanel={<SidePanel />}
      helpLink={helpLink}
    >
      <Box mb="270px" />
      <ActionButton onClick={handleFinish}>Finish</ActionButton>
    </ScreenLayout>
  )
}
