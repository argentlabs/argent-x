import { chromeStorageMock } from "@argent-x/extension/src/shared/storage/__test__/chrome-storage.mock"
import { ThemeProvider, muiTheme } from "@argent-x/extension/src/ui/theme"
import { ThemeProvider as ArgentTheme } from "@argent/ui"
import { useColorMode } from "@chakra-ui/react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { Story } from "@storybook/react"
import React, { FC, PropsWithChildren, useEffect } from "react"

/** polyfill browser extension storage  */
global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    id: "test",
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  storage: chromeStorageMock,
}

interface ColorModeProps extends PropsWithChildren {
  colorMode: "light" | "dark"
}

const ColorMode: FC<ColorModeProps> = ({ colorMode, children }) => {
  const { setColorMode } = useColorMode()

  useEffect(() => {
    setColorMode(colorMode)
  }, [colorMode])

  return <>{children}</>
}

export const decorators = [
  (Story: Story, context: any) => (
    <MuiThemeProvider theme={muiTheme}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <ThemeProvider>
        <ArgentTheme>
          <ColorMode colorMode={context.globals.colorMode}>
            <Story />
          </ColorMode>
        </ArgentTheme>
      </ThemeProvider>
    </MuiThemeProvider>
  ),
]
