import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { FC, Suspense } from "react"
import { SWRConfig } from "swr"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { useExtensionIsInTab } from "./features/browser/tabs"
import { useTracking } from "./services/analytics"
import { swrCacheProvider } from "./services/swr"
import {
  FixedGlobalStyle,
  ThemeProvider as StyledComponentsThemeProvider,
  ThemedGlobalStyle,
  muiTheme,
} from "./theme"

export const App: FC = () => {
  useTracking()
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <SWRConfig value={{ provider: () => swrCacheProvider }}>
      <MuiThemeProvider theme={muiTheme}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <FixedGlobalStyle extensionIsInTab={extensionIsInTab} />
        <StyledComponentsThemeProvider>
          <ThemedGlobalStyle />
          <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </StyledComponentsThemeProvider>
      </MuiThemeProvider>
    </SWRConfig>
  )
}
