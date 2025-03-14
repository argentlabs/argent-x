import {
  SuccessSecondaryIcon,
  InfoCircleSecondaryIcon,
} from "@argent/x-ui/icons"
import { MassiveTitle, P3 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"

import { ScreenLayout } from "./ScreenLayout"
import { SignerType } from "../../../../shared/wallet.model"
import { useMemo } from "react"
import { ActionButton } from "../../../components/FullScreenPage"

interface MultisigThirdStepProps {
  index: number
  goBack: () => void
  totalSteps?: number
  creatorType: SignerType
  filledIndicator?: boolean
}

export const MultisigThirdStep = ({
  index,
  goBack,
  totalSteps,
  creatorType,
  filledIndicator,
}: MultisigThirdStepProps) => {
  const handleFinish = () => {
    window.close()
  }

  const content = useMemo(() => {
    if (creatorType === SignerType.LEDGER) {
      return (
        <Flex
          borderRadius="lg"
          border="1px solid"
          borderColor="white.30"
          p="3"
          alignItems="center"
          gap="2"
          mb="270px"
        >
          <InfoCircleSecondaryIcon color="neutrals.200" />
          <P3 color="neutrals.200">
            Ledger accounts aren’t recoverable from an Argent X seed phrase. You
            need to add them again
          </P3>
        </Flex>
      )
    }
    return null
  }, [creatorType])

  return (
    <ScreenLayout
      subtitle="Reopen the Argent X extension and add funds to your multisig to activate"
      currentIndex={index}
      title={
        <MassiveTitle display="flex">
          Multisig created{" "}
          <SuccessSecondaryIcon
            color="success.500"
            alignSelf="flex-end"
            ml="1"
          />
        </MassiveTitle>
      }
      goBack={goBack}
      back={false}
      length={totalSteps}
      filledIndicator={filledIndicator}
    >
      {content}
      <ActionButton onClick={handleFinish}>Finish</ActionButton>
    </ScreenLayout>
  )
}
