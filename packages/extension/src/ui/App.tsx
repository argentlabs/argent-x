import { EventEmitterProvider } from "@argent/shared"
import {
  ThemeProvider as ArgentTheme,
  NavigationContainerSkeleton,
  SetDarkMode,
} from "@argent/ui"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import Emittery from "emittery"
import { FC, Suspense, useRef } from "react"
import { SWRConfig } from "swr"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AppDimensions } from "./components/Responsive"
import DevUI from "./features/dev/DevUI"
import { useCaptureEntryRouteRestorationState } from "./features/stateRestoration/useRestorationState"
import { useTracking } from "./services/analytics"
import SoftReloadProvider from "./services/resetAndReload"
import { useSentryInit } from "./services/sentry"
import { onErrorRetry, swrCacheProvider } from "./services/swr.service"
import { ThemeProvider, muiTheme } from "./theme"
import { allAccountsView } from "./views/account"
import { useView } from "./views/implementation/react"
import { allNftsView } from "./views/nft"

/** TODO: refactor: remove when test `User should be able to restore default networks if network is not selected` passes without this workaround */
const useAccountsListFix = () => {
  useView(allAccountsView)
}

/** TODO: this is a workaround for background storage updates to `nftsRepository` not propagating into ui `allNftsView` unless the hook is mounted */
const useNftsFix = () => {
  useView(allNftsView)
}

export const App: FC = () => {
  const emitter = useRef(new Emittery()).current
  useTracking()
  useSentryInit()
  useCaptureEntryRouteRestorationState()
  useAccountsListFix()
  useNftsFix()
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
            <ArgentTheme>
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
            </ArgentTheme>
          </ThemeProvider>
        </MuiThemeProvider>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
