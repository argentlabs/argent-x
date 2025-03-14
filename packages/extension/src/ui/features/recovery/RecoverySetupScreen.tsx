import { ResetPrimaryIcon } from "@argent/x-ui/icons"
import {
  BarCloseButton,
  CellStack,
  H1,
  NavigationContainer,
  P2,
} from "@argent/x-ui"
import type { FC } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Option } from "../../components/Option"
import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { CircleIconContainer } from "./ui/CircleIconContainer"
import { ComingSoonIcon } from "./ui/ComingSoonIcon"

export const RecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton
          onClick={() => navigate(returnTo || routes.accountTokens())}
        />
      }
    >
      <CellStack>
        <H1>Set up account recovery</H1>
        <P2>
          Choose one or more of the methods below to ensure you can access your
          accounts.
        </P2>
        <Option
          title="With Argent guardian"
          description="Coming soon"
          disabled
          icon={<ComingSoonIcon />}
        />
        <Option
          as={Link}
          to={routes.setupSeedRecovery(returnTo)}
          title="Save the recovery phrase"
          icon={
            <CircleIconContainer>
              <ResetPrimaryIcon />
            </CircleIconContainer>
          }
        />
      </CellStack>
    </NavigationContainer>
  )
}
