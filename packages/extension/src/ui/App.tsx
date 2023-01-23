import { ThemeProvider as ArgentTheme, SetDarkMode } from "@argent/ui"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { FC, Suspense } from "react"
import { SWRConfig } from "swr"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AppDimensions } from "./components/Responsive"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import DevUI from "./features/dev/DevUI"
import { useCaptureEntryRouteRestorationState } from "./features/stateRestoration/useRestorationState"
import { useTracking } from "./services/analytics"
import SoftReloadProvider from "./services/resetAndReload"
import { useSentryInit } from "./services/sentry"
import { swrCacheProvider } from "./services/swr"
import { ThemeProvider, muiTheme } from "./theme"

export const App: FC = () => {
  useTracking()
  useSentryInit()
  useCaptureEntryRouteRestorationState()
  return (
    <SoftReloadProvider>
      <SWRConfig value={{ provider: () => swrCacheProvider }}>
        <MuiThemeProvider theme={muiTheme}>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
            rel="stylesheet"
          />
          <ThemeProvider>
            <ArgentTheme>
              <SetDarkMode />
              <AppDimensions>
                {process.env.SHOW_DEV_UI && <DevUI />}
                <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
                  <Suspense fallback={<LoadingScreen />}>
                    <AppRoutes />
                  </Suspense>
                </ErrorBoundary>
              </AppDimensions>
            </ArgentTheme>
          </ThemeProvider>
        </MuiThemeProvider>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
