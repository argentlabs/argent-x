import { BarBackButton, H3, NavigationContainer } from "@argent/x-ui"
import { FC } from "react"

interface ErrorScreen {
  error: string
  onClick: () => void
}

export const ErrorScreen: FC<ErrorScreen> = ({ error, onClick }) => {
  return (
    <NavigationContainer leftButton={<BarBackButton onClick={onClick} />}>
      <H3 mt="4" textAlign="center">
        {error}
      </H3>
    </NavigationContainer>
  )
}
