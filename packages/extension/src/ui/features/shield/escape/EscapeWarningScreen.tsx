import { BarCloseButton, H1, NavigationContainer } from "@argent/ui"
import { FC } from "react"

import { useRouteAccountAddress } from "../../../routes"

export const EscapeWarningScreen: FC = () => {
  const accountAddress = useRouteAccountAddress()

  return (
    <NavigationContainer
      rightButton={<BarCloseButton />}
      title={"Escape Warning"}
    >
      <H1>Escape warning for {accountAddress} in here</H1>
    </NavigationContainer>
  )
}
