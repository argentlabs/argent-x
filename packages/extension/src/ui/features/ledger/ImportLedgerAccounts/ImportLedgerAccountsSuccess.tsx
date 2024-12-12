import { icons, MassiveTitle, P3 } from "@argent/x-ui"
import { Flex, HStack } from "@chakra-ui/react"
import type { FC } from "react"
import { useMemo } from "react"
import { ActionButton } from "../../../components/FullScreenPage"
import { SidePanel } from "../layout/Panel"
import { ScreenLayout } from "../layout/ScreenLayout"

const { InfoCircleSecondaryIcon, SuccessSecondaryIcon } = icons

export const ImportedLedgerAccountsSuccess: FC<{
  index: number
  totalSteps: number
  helpLink: string
  filledIndicator?: boolean
}> = ({ index, totalSteps, helpLink, filledIndicator }) => {
  const handleFinish = () => {
    window.close()
  }

  const content = useMemo(() => {
    return (
      <Flex
        borderRadius="lg"
        border="1px solid"
        borderColor="white.30"
        p="3"
        alignItems="center"
        gap="2"
        mb="270px"
        mt="10"
      >
        <InfoCircleSecondaryIcon color="neutrals.200" h={4} w={4} />
        <P3 color="neutrals.200">
          Ledger accounts aren’t recoverable from an Argent X seed phrase. You
          need to add them again
        </P3>
      </Flex>
    )
  }, [])

  return (
    <ScreenLayout
      subtitle="Your Ledger accounts have been successfully added and are available from the account list in your ArgentX wallet"
      currentIndex={index}
      title={
        <HStack>
          <MassiveTitle>Accounts added</MassiveTitle>
          <SuccessSecondaryIcon color="success.500" ml="1" h={8} w={8} />
        </HStack>
      }
      back={false}
      length={totalSteps}
      filledIndicator={filledIndicator}
      sidePanel={<SidePanel />}
      helpLink={helpLink}
    >
      {content}
      <ActionButton onClick={handleFinish}>Finish</ActionButton>
    </ScreenLayout>
  )
}
