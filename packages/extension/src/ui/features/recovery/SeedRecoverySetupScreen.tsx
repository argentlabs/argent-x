import { BarBackButton, BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { Paragraph } from "../../components/Page"
import { routes, useReturnTo } from "../../routes"
import { DeprecatedConfirmScreen } from "../actions/DeprecatedConfirmScreen"
import { CopySeedPhrase } from "./CopySeedPhrase"
import { SeedPhrase } from "./SeedPhrase"
import { useSeedPhrase } from "./useSeedPhrase"

export const SeedRecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const seedPhrase = useSeedPhrase()
  const returnTo = useReturnTo()

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={
        <BarCloseButton onClick={() => navigate(routes.accountTokens())} />
      }
    >
      <DeprecatedConfirmScreen
        smallTopPadding
        title="Recovery phrase"
        singleButton
        confirmButtonText="Continue"
        confirmButtonDisabled={!seedPhrase}
        onSubmit={() => navigate(routes.confirmSeedRecovery(returnTo))}
      >
        <Paragraph>
          Write these words down on paper. It is unsafe to save them on your
          computer.
        </Paragraph>

        <SeedPhrase seedPhrase={seedPhrase} />

        <CopySeedPhrase seedPhrase={seedPhrase} />
      </DeprecatedConfirmScreen>
    </NavigationContainer>
  )
}
