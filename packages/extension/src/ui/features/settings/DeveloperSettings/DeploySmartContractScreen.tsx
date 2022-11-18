import { BarBackButton, Button, NavigationContainer } from "@argent/ui"
import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"

import { StickyGroup } from "../../actions/ConfirmScreen"
import { DeploySmartContractForm } from "./DeploySmartContractForm"

const DeploySmartContractScreen: FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title={"Declare smart contract"}
    >
      <DeploySmartContractForm setIsLoading={setIsLoading}>
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
