import { BarBackButton, Button, NavigationContainer } from "@argent/ui"
import { FC, useState } from "react"

import { StickyGroup } from "../../actions/transaction/DeprecatedConfirmScreen"
import { DeploySmartContractForm } from "./DeploySmartContractForm"

const DeploySmartContractScreen: FC = () => {
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
          <StickyGroup>
            <Button
              gap="2"
              colorScheme="primary"
              type="submit"
              disabled={!isDirty || isSubmitting || isLoading}
              width="100%"
              isLoading={isLoading}
              loadingText="Loading constructor fields"
            >
              Deploy
            </Button>
          </StickyGroup>
        )}
      </DeploySmartContractForm>
    </NavigationContainer>
  )
}

export { DeploySmartContractScreen }
