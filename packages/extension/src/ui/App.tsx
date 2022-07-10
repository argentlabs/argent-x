import { ThemeProvider } from "@mui/material"
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
import { swrCacheProvider } from "./services/swr"
import { GlobalStyle, theme } from "./theme"

export const App: FC = () => {
  useTracking()
  const extensionIsInTab = useExtensionIsInTab()
  return (
    <SoftReloadProvider>
      <SWRConfig value={{ provider: () => swrCacheProvider }}>
        <ThemeProvider theme={theme}>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
            rel="stylesheet"
          />
          <GlobalStyle extensionIsInTab={extensionIsInTab} />
          {process.env.SHOW_DEV_UI && <DevUI />}
          <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </ThemeProvider>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
