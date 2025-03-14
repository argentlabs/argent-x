import { EventEmitterProvider } from "@argent/x-ui"
import { SetDarkMode } from "@argent/x-ui/theme"
import Emittery from "emittery"
import type { FC } from "react"
import { useRef } from "react"
import { SWRConfig } from "swr"
import { MotionConfig } from "framer-motion"
import { BrowserRouter } from "react-router-dom"

import AppErrorBoundaryFallback from "./AppErrorBoundaryFallback"
import { AppRoutes } from "./AppRoutes"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { AppDimensions } from "./components/Responsive"
import SoftReloadProvider from "./services/resetAndReload"
import { onErrorRetry, swrCacheProvider } from "./services/swr.service"
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
import { I18N_ENABLED } from "../shared/i18n/constants"

if (I18N_ENABLED) {
  console.warn("I18N_ENABLED is true, uncomment the import in App.tsx")
  // import("./i18n")
}

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
      </SWRConfig>
    </SoftReloadProvider>
  )
}
