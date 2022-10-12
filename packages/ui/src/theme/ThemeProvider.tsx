import { FC, PropsWithChildren } from "react"
import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components"

import { theme } from "./index"

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      {children}
    </StyledComponentsThemeProvider>
  )
}
