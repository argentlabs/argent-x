import { ThemeProvider, createTheme } from "@mui/material"
import { FC, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { useEntry } from "./hooks/useEntry"
import { routes } from "./routes"
import { AccountListScreen } from "./screens/AccountListScreen"
import { AccountScreen } from "./screens/AccountScreen"
import { ActionScreen } from "./screens/ActionScreen"
import { AddTokenScreen } from "./screens/AddTokenScreen"
import { BackupDownloadScreen } from "./screens/BackupDownloadScreen"
import { DappsScreen } from "./screens/DappsScreen"
import { DisclaimerScreen } from "./screens/DisclaimerScreen"
import { ErrorScreen } from "./screens/ErrorScreen"
import { HideTokenScreen } from "./screens/HideTokenScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { NewWalletScreen } from "./screens/NewWalletScreen"
import { PasswordScreen } from "./screens/PasswordScreen"
import { ResetScreen } from "./screens/ResetScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { TokenScreen } from "./screens/TokenScreen"
import { UploadKeystoreScreen } from "./screens/UploadKeystoreScreen"
import { WelcomeScreen } from "./screens/WelcomeScreen"
import { useActions, useActionsSubscription } from "./states/actions"
import { useAppState } from "./states/app"
import { swrCacheProvider } from "./utils/swrCache"

const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #161616;;
    color: white;

    min-width: 320px;
    min-height: 568px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    margin-block: 0;
  }
`

const theme = createTheme({
  palette: {
    mode: "dark",
  },
})

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

const Screen: FC = () => {
  useEntry()
  useActionsSubscription()

  const { isLoading } = useAppState()
  const { actions } = useActions()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Routes which need no unlocked keystore */}
      <Route path={routes.welcome()} element={<WelcomeScreen />} />
      <Route path={routes.newWallet()} element={<NewWalletScreen />} />
      <Route path={routes.recoverBackup()} element={<UploadKeystoreScreen />} />
      <Route path={routes.password()} element={<PasswordScreen />} />
      <Route path={routes.reset()} element={<ResetScreen />} />
      <Route path={routes.disclaimer()} element={<DisclaimerScreen />} />
      <Route path={routes.error()} element={<ErrorScreen />} />

      {/* Routes which need an unlocked keystore and therefore can also sign actions */}
      {actions[0] ? (
        <Route path="*" element={<ActionScreen />} />
      ) : (
        <>
          <Route path={routes.account()} element={<AccountScreen />} />
          <Route path={routes.accounts()} element={<AccountListScreen />} />
          <Route path={routes.newToken()} element={<AddTokenScreen />} />
          <Route path={routes.dappConnections()} element={<DappsScreen />} />
          <Route path={routes.tokenPath()} element={<TokenScreen />} />
          <Route path={routes.hideTokenPath()} element={<HideTokenScreen />} />
          <Route path={routes.settings()} element={<SettingsScreen />} />
          <Route
            path={routes.backupDownload()}
            element={<BackupDownloadScreen />}
          />
        </>
      )}
    </Routes>
  )
}
