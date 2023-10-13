import { BarBackButton, Button, NavigationContainer } from "@argent/ui"
import { FC } from "react"

import { Flex } from "@chakra-ui/react"
import { DeclareSmartContractForm } from "./DeclareSmartContractForm"

const DeclareSmartContractScreen: FC = () => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Declare smart contract"}
    >
      <DeclareSmartContractForm>
        {({ isDirty, isSubmitting, hasInvalidFile, isBusy }) => (
          <>
            <Flex flex="1" />
            <Button
              w="full"
              colorScheme="primary"
              type="submit"
              disabled={!isDirty || isSubmitting || hasInvalidFile || isBusy}
            >
              Declare
            </Button>
          </>
        )}
      </DeclareSmartContractForm>
    </NavigationContainer>
  )
}

export { DeclareSmartContractScreen }
