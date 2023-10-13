import { FC, PropsWithChildren, useEffect } from "react"
import { ThemeProvider, muiTheme } from "@argent-x/extension/src/ui/theme"
import { ThemeProvider as ArgentTheme } from "@argent/ui"
import { useColorMode } from "@chakra-ui/react"
import { Flex } from "@chakra-ui/react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { Preview } from "@storybook/react"

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

interface GlobalStoryLayoutProps extends PropsWithChildren {
  /** https://storybook.js.org/docs/web-components/configure/story-layout */
  layout: "centered" | "padded" | "fullscreen"
}

const GlobalStoryLayout: FC<GlobalStoryLayoutProps> = ({
  layout,
  children,
}) => {
  if (layout === "fullscreen") {
    return (
      <Flex height={"100vh"} direction={"column"} flex={1} bg={"bg"}>
        {children}
      </Flex>
    )
  }
  return <>{children}</>
}

export const decorators: Preview["decorators"] = [
  (Story, context) => {
    const { parameters, globals } = context
    return (
      <MuiThemeProvider theme={muiTheme}>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <ThemeProvider>
          <ArgentTheme>
            <ColorMode colorMode={globals.colorMode}>
              <GlobalStoryLayout layout={parameters.layout}>
                <Story />
              </GlobalStoryLayout>
            </ColorMode>
          </ArgentTheme>
        </ThemeProvider>
      </MuiThemeProvider>
    )
  },
]
