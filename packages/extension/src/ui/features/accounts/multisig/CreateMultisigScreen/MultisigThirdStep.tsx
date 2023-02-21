import { H1 } from "@argent/ui"
import { icons } from "@argent/ui"
import { Button } from "@chakra-ui/react"

import { ScreenLayout } from "./ScreenLayout"

const { TickCircleIcon } = icons
export const MultisigThirdStep = ({
  index,
  goBack,
}: {
  index: number
  goBack: () => void
}) => {
  const handleFinish = () => {
    window.close()
  }
  return (
    <ScreenLayout
      subtitle="Reopen the Argent X extension and add funds to your multisig to activate"
      currentIndex={index}
      title={
        <H1 display="flex">
          Multisig created{" "}
          <TickCircleIcon color="#3ED373" alignSelf="flex-end" ml="1" />
        </H1>
      }
      goBack={goBack}
      back={true}
    >
      <Button colorScheme="primary" onClick={handleFinish}>
        Finish
      </Button>
    </ScreenLayout>
  )
}
