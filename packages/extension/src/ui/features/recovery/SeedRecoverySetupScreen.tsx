import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { IconBar } from "../../components/IconBar"
import { Paragraph } from "../../components/Page"
import { routes, useReturnTo } from "../../routes"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { CopySeedPhrase } from "./CopySeedPhrase"
import { SeedPhrase } from "./SeedPhrase"
import { useSeedPhrase } from "./useSeedPhrase"

export const SeedRecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const seedPhrase = useSeedPhrase()
  const returnTo = useReturnTo()

  return (
    <>
      <IconBar back close={returnTo} />
      <ConfirmScreen
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
      </ConfirmScreen>
    </>
  )
}
