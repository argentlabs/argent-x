import {
  BarCloseButton,
  NavigationContainer,
  iconsDeprecated,
} from "@argent/x-ui"
import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Option } from "../../components/Options"
import { PageWrapper, Paragraph, Title } from "../../components/Page"
import { useReturnTo } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { CircleIconContainer } from "./ui/CircleIconContainer"
import { ComingSoonIcon } from "./ui/ComingSoonIcon"
import { Grid } from "@chakra-ui/react"

const { RestoreIcon } = iconsDeprecated

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
      <PageWrapper>
        <Title>Set up account recovery</Title>
        <Paragraph>
          Choose one or more of the methods below to ensure you can access your
          accounts.
        </Paragraph>
        <Grid templateColumns="1fr" gap={4}>
          <Option
            title="With Argent guardian"
            description="Coming soon"
            disabled
            icon={<ComingSoonIcon />}
          />
          <Link to={routes.setupSeedRecovery(returnTo)}>
            <Option
              title="Save the recovery phrase"
              icon={
                <CircleIconContainer>
                  <RestoreIcon />
                </CircleIconContainer>
              }
            />
          </Link>
        </Grid>
      </PageWrapper>
    </NavigationContainer>
  )
}
