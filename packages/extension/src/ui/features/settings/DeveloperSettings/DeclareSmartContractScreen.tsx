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
        {({ isDirty, isSubmitting, hasInvalidFile, isBusy }) => (
          <StickyGroup>
            <Button
              gap="2"
              colorScheme="primary"
              type="submit"
              disabled={!isDirty || isSubmitting || hasInvalidFile || isBusy}
              width="100%"
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
