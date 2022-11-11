import { BarBackButton, Button, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { StickyGroup } from "../../actions/ConfirmScreen"
import { DeclareSmartContractForm } from "./DeclareSmartContractForm"

const DeclareSmartContractScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title={"Declare smart contract"}
    >
      <DeclareSmartContractForm>
        {({ isDirty, isSubmitting }) => (
          <StickyGroup>
            <Button
              gap="2"
              colorScheme="primary"
              type="submit"
              disabled={!isDirty || isSubmitting}
              width="100%"
              /* isLoading={isLoading} */
              loadingText="Unlocking"
            >
              Declare
            </Button>
          </StickyGroup>
        )}
      </DeclareSmartContractForm>
    </NavigationContainer>
  )
}

export { DeclareSmartContractScreen }
