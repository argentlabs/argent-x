import { ThemeProvider as ArgentTheme } from "@argent/ui"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { FC, Suspense } from "react"
import { SWRConfig } from "swr"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { useExtensionIsInTab } from "./features/browser/tabs"
import DevUI from "./features/dev/DevUI"
import { useTracking } from "./services/analytics"
import SoftReloadProvider from "./services/resetAndReload"
import { useSentryInit } from "./services/sentry"
import { swrCacheProvider } from "./services/swr"
import {
  FixedGlobalStyle,
  ThemeProvider,
  ThemedGlobalStyle,
  muiTheme,
} from "./theme"

export const App: FC = () => {
  useTracking()
  useSentryInit()
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <SoftReloadProvider>
      <SWRConfig value={{ provider: () => swrCacheProvider }}>
        <ArgentTheme>
          <MuiThemeProvider theme={muiTheme}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link
              href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
              rel="stylesheet"
            />
            <FixedGlobalStyle extensionIsInTab={extensionIsInTab} />
            {process.env.SHOW_DEV_UI && <DevUI />}
            <ThemeProvider>
              <ThemedGlobalStyle />
              <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
                <Suspense fallback={<LoadingScreen />}>
                  <AppRoutes />
                </Suspense>
              </ErrorBoundary>
            </ThemeProvider>
          </MuiThemeProvider>
        </ArgentTheme>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
