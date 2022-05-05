import { ThemeProvider, createTheme } from "@mui/material"
import { FC, Suspense } from "react"
import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import styled, { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import { SWRConfig } from "swr"

import { NftScreen } from "./features/accountNfts/NftScreen"
import { BackupRecoveryScreen } from "./features/recovery/BackupRecoveryScreen"
import { RecoverySetupScreen } from "./features/recovery/RecoverySetupScreen"
import { SeedRecoveryConfirmScreen } from "./features/recovery/SeedRecoveryConfirmScreen"
import { SeedRecoveryPasswordScreen } from "./features/recovery/SeedRecoveryPasswordScreen"
import { SeedRecoveryScreen } from "./features/recovery/SeedRecoveryScreen"
import { SeedRecoverySetupScreen } from "./features/recovery/SeedRecoverySetupScreen"
import { DappConnectionsSettingsScreen } from "./features/settings/DappConnectionsSettingsScreen"
import { NetworkSettingsFormScreen } from "./features/settings/NetworkSettingsFormScreen"
import { NetworkSettingsScreen } from "./features/settings/NetworkSettingsScreen"
import { SettingsScreen } from "./features/settings/SettingsScreen"
import { useEntry } from "./hooks/useEntry"
import { useTransactionErrorScreen } from "./hooks/useTransactionErrorScreen"
import { routes } from "./routes"
import { AccountListScreen } from "./screens/AccountListScreen"
import { AccountScreen } from "./screens/AccountScreen"
import { ActionScreen } from "./screens/ActionScreen"
import { AddTokenScreen } from "./screens/AddTokenScreen"
import { BackupDownloadScreen } from "./screens/BackupDownloadScreen"
import { DisclaimerScreen } from "./screens/DisclaimerScreen"
import { ErrorScreen } from "./screens/ErrorScreen"
import { HideTokenScreen } from "./screens/HideTokenScreen"
import { LegacyScreen } from "./screens/LegacyScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { LockScreen } from "./screens/LockScreen"
import { NetworkWarningScreen } from "./screens/NetworkWarningScreen"
import { NewWalletScreen } from "./screens/NewWalletScreen"
import { ResetScreen } from "./screens/ResetScreen"
import { TokenScreen } from "./screens/TokenScreen"
import { UpgradeScreen } from "./screens/UpgradeScreen"
import { WelcomeScreen } from "./screens/WelcomeScreen"
import { useActions, useActionsSubscription } from "./states/actions"
import { useAppState } from "./states/app"
import { useSelectedNetwork } from "./states/selectedNetwork"
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
  const [selectedCustomNetwork] = useSelectedNetwork()

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
        <Route path={routes.welcome.path} element={<WelcomeScreen />} />
        <Route path={routes.newWallet.path} element={<NewWalletScreen />} />
        <Route
          path={routes.backupRecovery.path}
          element={<BackupRecoveryScreen />}
        />
        <Route
          path={routes.seedRecovery.path}
          element={<SeedRecoveryScreen />}
        />
        <Route
          path={routes.seedRecoveryPassword.path}
          element={<SeedRecoveryPasswordScreen />}
        />
        <Route path={routes.lockScreen.path} element={<LockScreen />} />
        <Route path={routes.reset.path} element={<ResetScreen />} />
        <Route path={routes.disclaimer.path} element={<DisclaimerScreen />} />
        <Route path={routes.legacy.path} element={<LegacyScreen />} />
        <Route path={routes.error.path} element={<ErrorScreen />} />

        {/* Routes which need an unlocked backup and therefore can also sign actions */}
        {actions[0] ? (
          <Route path="*" element={<ActionScreen />} />
        ) : (
          <>
            <Route
              path={routes.networkWarning.path}
              element={<NetworkWarningScreen />}
            />
            <Route path={routes.accountNft.path} element={<NftScreen />} />
            <Route
              path={routes.accountTokens.path}
              element={<AccountScreen tab="tokens" />}
            />
            <Route
              path={routes.accountNfts.path}
              element={<AccountScreen tab="nfts" />}
            />
            <Route
              path={routes.accountActivity.path}
              element={<AccountScreen tab="activity" />}
            />
            <Route path={routes.upgrade.path} element={<UpgradeScreen />} />
            <Route
              path={routes.accounts.path}
              element={<AccountListScreen />}
            />
            <Route
              path={routes.confirmSeedRecovery.path}
              element={<SeedRecoveryConfirmScreen />}
            />
            <Route
              path={routes.setupSeedRecovery.path}
              element={<SeedRecoverySetupScreen />}
            />
            <Route
              path={routes.setupRecovery.path}
              element={<RecoverySetupScreen />}
            />
            <Route path={routes.newToken.path} element={<AddTokenScreen />} />
            <Route path={routes.token.path} element={<TokenScreen />} />
            <Route path={routes.hideToken.path} element={<HideTokenScreen />} />
            <Route path={routes.settings.path} element={<SettingsScreen />} />
            <Route
              path={routes.settingsNetworks.path}
              element={<NetworkSettingsScreen />}
            />
            <Route
              path={routes.settingsAddCustomNetwork.path}
              element={<NetworkSettingsFormScreen mode="add" />}
            />
            <Route
              path={routes.settingsEditCustomNetwork.path}
              element={
                selectedCustomNetwork ? (
                  <NetworkSettingsFormScreen
                    mode="edit"
                    network={selectedCustomNetwork}
                  />
                ) : (
                  <Navigate to={routes.settingsNetworks.path} />
                )
              }
            />
            <Route
              path={routes.settingsDappConnections.path}
              element={<DappConnectionsSettingsScreen />}
            />
            <Route
              path={routes.backupDownload.path}
              element={<BackupDownloadScreen />}
            />
          </>
        )}
      </Route>
    </Routes>
  )
}
