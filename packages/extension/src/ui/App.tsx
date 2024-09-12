import { EventEmitterProvider } from "@argent/x-shared"
import { SetDarkMode } from "@argent/x-ui"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import Emittery from "emittery"
import { FC, useRef } from "react"
import { SWRConfig } from "swr"
import { MotionConfig } from "framer-motion"
import { BrowserRouter } from "react-router-dom"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AppDimensions } from "./components/Responsive"
import SoftReloadProvider from "./services/resetAndReload"
import { onErrorRetry, swrCacheProvider } from "./services/swr.service"
import { muiTheme } from "./theme"
import { useAnalytics } from "./hooks/useAnalytics"
import { ArgentUIProviders } from "./providers/ArgentUIProviders"
import { useGlobalUtilityMethods } from "./hooks/useGlobalUtilityMethods"
import { useReduceMotionSetting } from "./hooks/useReduceMotionSetting"
import { SuspenseScreen } from "./components/SuspenseScreen"
import { CaptureEntryRouteRestorationState } from "./features/stateRestoration/CaptureEntryRouteRestorationState"
import { useBrowserExtensionSentryInit } from "./services/useBrowserExtensionSentryInit"
import { DevUI } from "./features/dev/DevUI"
import { AppThemeProvider } from "./AppThemeProvider"
import { Toaster } from "sonner"
import { DarkMode, Portal } from "@chakra-ui/react"

export const App: FC = () => {
  const emitter = useRef(new Emittery()).current
  useAnalytics()
  useBrowserExtensionSentryInit()
  useGlobalUtilityMethods()
  const reducedMotion = useReduceMotionSetting()
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
          <MotionConfig reducedMotion={reducedMotion}>
            <AppThemeProvider>
              <Portal>
                <DarkMode>
                  <Toaster
                    style={{
                      marginBottom: "48px",
                    }}
                  />
                </DarkMode>
              </Portal>
              <SetDarkMode />
              <AppDimensions>
                <EventEmitterProvider emitter={emitter}>
                  <ArgentUIProviders>
                    {DevUI && <DevUI />}
                    <BrowserRouter>
                      <CaptureEntryRouteRestorationState />
                      <ErrorBoundary fallback={<AppErrorBoundaryFallback />}>
                        <SuspenseScreen>
                          <AppRoutes />
                        </SuspenseScreen>
                      </ErrorBoundary>
                    </BrowserRouter>
                  </ArgentUIProviders>
                </EventEmitterProvider>
              </AppDimensions>
            </AppThemeProvider>
          </MotionConfig>
        </MuiThemeProvider>
      </SWRConfig>
    </SoftReloadProvider>
  )
}
