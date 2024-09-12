import { FC } from "react"
import { ScreenLayout } from "../layout/ScreenLayout"
import { RestoreMultisigSidePanel } from "./RestoreMultisigSidePanel"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { H6, P4 } from "@argent/x-ui"
import { ActionButton } from "../../../components/FullScreenPage"

export interface FoundMultisigData {
  signerKey: string
  address: string
}

export const RestoreFound: FC<{
  currentStep: number
  totalSteps: number
  helpLink?: string
  foundMultisigs?: FoundMultisigData[]
}> = ({ currentStep, totalSteps, helpLink, foundMultisigs = [] }) => {
  return (
    <ScreenLayout
      title="Your multisigs have been restored"
      subtitle="You can access your multisigs from the account list in your Argent X wallet"
      sidePanel={<RestoreMultisigSidePanel found />}
      currentIndex={currentStep}
      length={totalSteps}
      helpLink={helpLink}
      filledIndicator
    >
      <Box
        mt="5"
        pt="5"
        borderTop="1px solid"
        borderColor="neutrals.700"
        width="100%"
      >
        <VStack spacing="2">
          {foundMultisigs.map((foundMultisig) => (
            <FoundMultisigListItem
              key={foundMultisig.address}
              foundMultisig={foundMultisig}
            />
          ))}
        </VStack>
        <Box mt="112px">
          <ActionButton onClick={window.close}>Finish</ActionButton>
        </Box>
      </Box>
    </ScreenLayout>
  )
}

const FoundMultisigListItem: FC<{ foundMultisig: FoundMultisigData }> = ({
  foundMultisig,
}) => {
  const firstParthSignerKey = foundMultisig.signerKey.slice(0, 7)
  const lastPartSignerKey = foundMultisig.signerKey.slice(-5)
  return (
    <Box
      padding="13px 20px"
      borderRadius="lg"
      bgColor="neutrals.800"
      width="100%"
    >
      <Flex flexDirection="column" gap="2px">
        <H6 color="white">
          {firstParthSignerKey}...{lastPartSignerKey}
        </H6>
        <P4 fontWeight="bold" color="neutrals.400">
          {foundMultisig.address}
        </P4>
      </Flex>
    </Box>
  )
}
