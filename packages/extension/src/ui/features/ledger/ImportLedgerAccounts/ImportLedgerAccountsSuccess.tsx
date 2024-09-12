import { H1, P4, iconsDeprecated, logosDeprecated } from "@argent/x-ui"
import { Box, Flex, HStack } from "@chakra-ui/react"
import { FC, useMemo } from "react"
import { ScreenLayout } from "../layout/ScreenLayout"
import { ActionButton } from "../../../components/FullScreenPage"
import { Panel } from "../layout/Panel"

const { InfoIcon, TickCircleIcon } = iconsDeprecated
const { ArgentXLogo } = logosDeprecated

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
        <InfoIcon color="neutrals.200" h={4} w={4} />
        <P4 color="neutrals.200">
          Ledger accounts aren’t recoverable from an Argent X seed phrase. You
          need to add them again
        </P4>
      </Flex>
    )
  }, [])

  return (
    <ScreenLayout
      subtitle="Your Ledger accounts have been successfully added and are available from the account list in your ArgentX wallet"
      currentIndex={index}
      title={
        <HStack>
          <H1>Accounts added</H1>
          <TickCircleIcon color="success.500" ml="1" h={8} w={8} />
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

const SidePanel = () => {
  return (
    <Box
      width={{ md: "31.25%" }}
      display={{ md: "flex" }}
      backgroundColor={{ md: "black" }}
      height={{ md: "100%" }}
      background={`url('./assets/onboarding-background.jpg') no-repeat center`}
      backgroundSize="cover"
    >
      <Panel>
        <ArgentXLogo w={20} h={20} />
      </Panel>
    </Box>
  )
}
