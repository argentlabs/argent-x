import { EventEmitterProvider } from "@argent/x-shared"
import { theme, NavigationContainerSkeleton, SetDarkMode } from "@argent/x-ui"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import Emittery from "emittery"
import { FC, Suspense, useRef } from "react"
import { SWRConfig } from "swr"
import { ChakraProvider } from "@chakra-ui/react"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AppDimensions } from "./components/Responsive"
import DevUI from "./features/dev/DevUI"
import { useCaptureEntryRouteRestorationState } from "./features/stateRestoration/useRestorationState"
import SoftReloadProvider from "./services/resetAndReload"
import { onErrorRetry, swrCacheProvider } from "./services/swr.service"
import { ThemeProvider, muiTheme } from "./theme"
import { useAnalytics } from "./hooks/useAnalytics"

console.warn(
  "HACK: patching theme with remapped old -> new colours - this hack must be removed",
)

/** TODO: remove - temporarily remap old values to new values */
const patchedTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    "neutrals.100": theme.colors["neutrals.200"],
    "neutrals.200": theme.colors["neutrals.300"],
    "neutrals.300": theme.colors["neutrals.400"],
    "neutrals.400": theme.colors["neutrals.500"],
    "neutrals.500": theme.colors["neutrals.600"],
    "neutrals.600": theme.colors["neutrals.700"],
    "neutrals.700": theme.colors["neutrals.800"],
    "neutrals.800": theme.colors["neutrals.900"],
    "neutrals.900": theme.colors["neutrals.1000"],
    // neutrals: {
    //   100: "#b7b7b9",
    //   200: "#9f9fa1",
    //   300: "#88888a",
    //   400: "#707072",
    //   500: "#58585b",
    //   600: "#404043",
    //   700: "#28282c",
    //   800: "#1d1f22",
    //   900: "#101014",
    // },
  },
  // back these colours the other way;
  semanticTokens: {
    colors: {
      ...theme.semanticTokens.colors,
      "surface-default": {
        default: "neutrals.100",
        _dark: "neutrals.900",
      },
      "surface-elevated": {
        default: "white.white",
        _dark: "neutrals.800",
      },
    },
  },
}

export const App: FC = () => {
  const emitter = useRef(new Emittery()).current
  useAnalytics()
  useCaptureEntryRouteRestorationState()
  return (
    <SoftReloadProvider>
      <SWRConfig
        value={{
          provider: () => swrCacheProvider,
          onErrorRetry: onErrorRetry,
        }}
      >
        <MuiThemeProvider theme={muiTheme}>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&display=swap"
            rel="stylesheet"
          />
          <ThemeProvider>
            <ChakraProvider theme={patchedTheme}>
              <SetDarkMode />
              <AppDimensions>
                {process.env.SHOW_DEV_UI && <DevUI />}
                <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
                  <Suspense fallback={<NavigationContainerSkeleton />}>
                    <EventEmitterProvider emitter={emitter}>
                      <AppRoutes />
                    </EventEmitterProvider>
                  </Suspense>
                </ErrorBoundary>
              </AppDimensions>
            </ChakraProvider>
          </ThemeProvider>
        </MuiThemeProvider>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
