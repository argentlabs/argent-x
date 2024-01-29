import { BarBackButton, Button, NavigationContainer } from "@argent/ui"
import { FC, useState } from "react"

import { Flex } from "@chakra-ui/react"
import { DeploySmartContractForm } from "./DeploySmartContractForm"

export const DeploySmartContractScreen: FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Deploy smart contract"}
    >
      <DeploySmartContractForm
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      >
        {({ isDirty, isSubmitting }) => (
          <>
            <Flex flex="1" />
            <Button
              w="full"
              colorScheme="primary"
              type="submit"
              disabled={!isDirty || isSubmitting || isLoading}
              isLoading={isLoading}
              loadingText="Loading constructor fields"
            >
              Deploy
            </Button>
          </>
        )}
      </DeploySmartContractForm>
    </NavigationContainer>
  )
}
