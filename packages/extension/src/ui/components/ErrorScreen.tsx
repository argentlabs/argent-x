import { BarBackButton, H2, NavigationContainer } from "@argent/x-ui"
import type { FC } from "react"

interface ErrorScreen {
  error: string
  onClick: () => void
}

export const ErrorScreen: FC<ErrorScreen> = ({ error, onClick }) => {
  return (
    <NavigationContainer leftButton={<BarBackButton onClick={onClick} />}>
      <H2 mt="4" textAlign="center">
        {error}
      </H2>
    </NavigationContainer>
  )
}
