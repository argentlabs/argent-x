import { ThemeProvider, createTheme } from "@mui/material"
import { FC, Suspense } from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import styled, { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { useEntry } from "./hooks/useEntry"
import { useTransactionErrorScreen } from "./hooks/useTransactionErrorScreen"
import { routes } from "./routes"
import { AccountListScreen } from "./screens/AccountListScreen"
import { AccountScreen } from "./screens/AccountScreen"
import { ActionScreen } from "./screens/ActionScreen"
import { AddTokenScreen } from "./screens/AddTokenScreen"
import { BackupDownloadScreen } from "./screens/BackupDownloadScreen"
import { BackupRecoveryScreen } from "./screens/BackupRecoveryScreen"
import { DisclaimerScreen } from "./screens/DisclaimerScreen"
import { ErrorScreen } from "./screens/ErrorScreen"
import { HideTokenScreen } from "./screens/HideTokenScreen"
import { LegacyScreen } from "./screens/LegacyScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { LockScreen } from "./screens/LockScreen"
import { NewWalletScreen } from "./screens/NewWalletScreen"
import { ResetScreen } from "./screens/ResetScreen"
import { SettingsDappConnectionsScreen } from "./screens/SettingsDappConnectionsScreen"
import { SettingsLocalhostPortScreen } from "./screens/SettingsLocalhostPortScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { SetupRecoveryPage } from "./screens/SetupRecovery"
import { SetupSeedRecoveryPage } from "./screens/SetupSeedRecovery"
import { TokenScreen } from "./screens/TokenScreen"
import { UpgradeScreen } from "./screens/UpgradeScreen"
import { WelcomeScreen } from "./screens/WelcomeScreen"
import { useActions, useActionsSubscription } from "./states/actions"
import { useAppState } from "./states/app"
import { swrCacheProvider } from "./utils/swrCache"

const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;
    color: white;
  }

  html, body {
    min-width: 360px;
    min-height: 600px;
    
    overscroll-behavior: none;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar { /* Chrome, Safari, Opera */
      display: none;
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }
`

const theme = createTheme({ palette: { mode: "dark" } })

export const App: FC = () => (
  <SWRConfig value={{ provider: () => swrCacheProvider }}>
    <ThemeProvider theme={theme}>
      <Suspense fallback={<LoadingScreen />}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <GlobalStyle />
        <Screen />
      </Suspense>
    </ThemeProvider>
  </SWRConfig>
)

export const ScrollBehaviour = styled.div`
  height: 100vh;
  overflow-y: auto;

  overscroll-behavior: none;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    /* Chrome, Safari, Opera */
    display: none;
  }
`

const Screen: FC = () => {
  useEntry()
  useActionsSubscription()
  useTransactionErrorScreen()

  const { isLoading } = useAppState()
  const { actions } = useActions()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route
        element={
          <ScrollBehaviour>
            <Outlet />
          </ScrollBehaviour>
        }
      >
        {/* Routes which need no unlocked backup */}
        <Route path={routes.welcome()} element={<WelcomeScreen />} />
        <Route path={routes.newWallet()} element={<NewWalletScreen />} />
        <Route
          path={routes.backupRecovery()}
          element={<BackupRecoveryScreen />}
        />
        <Route path={routes.lockScreen()} element={<LockScreen />} />
        <Route path={routes.reset()} element={<ResetScreen />} />
        <Route path={routes.disclaimer()} element={<DisclaimerScreen />} />
        <Route path={routes.legacy()} element={<LegacyScreen />} />
        <Route path={routes.error()} element={<ErrorScreen />} />

        {/* Routes which need an unlocked backup and therefore can also sign actions */}
        {actions[0] ? (
          <Route path="*" element={<ActionScreen />} />
        ) : (
          <>
            <Route path={routes.account()} element={<AccountScreen />} />
            <Route path={routes.upgrade()} element={<UpgradeScreen />} />
            <Route path={routes.accounts()} element={<AccountListScreen />} />
            <Route
              path={routes.setupSeedRecovery()}
              element={<SetupSeedRecoveryPage />}
            />
            <Route
              path={routes.setupRecovery()}
              element={<SetupRecoveryPage />}
            />
            <Route path={routes.newToken()} element={<AddTokenScreen />} />
            <Route path={routes.tokenPath()} element={<TokenScreen />} />
            <Route
              path={routes.hideTokenPath()}
              element={<HideTokenScreen />}
            />
            <Route path={routes.settings()} element={<SettingsScreen />} />
            <Route
              path={routes.settingsDappConnections()}
              element={<SettingsDappConnectionsScreen />}
            />
            <Route
              path={routes.settingsLocalhostPort()}
              element={<SettingsLocalhostPortScreen />}
            />
            <Route
              path={routes.backupDownload()}
              element={<BackupDownloadScreen />}
            />
          </>
        )}
      </Route>
    </Routes>
  )
}
