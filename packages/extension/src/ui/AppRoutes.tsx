import { FC, useEffect } from "react"
import { Outlet, Route, Routes } from "react-router-dom"
import styled from "styled-components"

import { AccountListScreen } from "./features/accountList/AccountListScreen"
import { NftScreen } from "./features/accountNfts/NftScreen"
import { HideTokenScreen } from "./features/accountTokens/HideTokenScreen"
import { useTokensSubscription } from "./features/accountTokens/tokens.state"
import { TokenScreen } from "./features/accountTokens/TokenScreen"
import { migrateUiTokensToBackground } from "./features/accountTokens/tokensLegacy.service"
import {
  useActions,
  useActionsSubscription,
} from "./features/actions/actions.state"
import { ActionScreen } from "./features/actions/ActionScreen"
import { AddTokenScreen } from "./features/actions/AddTokenScreen"
import { FundingQrCodeScreen } from "./features/funding/FundingQrCodeScreen"
import { FundingScreen } from "./features/funding/FundingScreen"
import { DisclaimerScreen } from "./features/onboarding/DisclaimerScreen"
import { LegacyScreen } from "./features/onboarding/LegacyWalletScreen"
import { LockScreen } from "./features/onboarding/LockScreen"
import { NewWalletScreen } from "./features/onboarding/NewWalletScreen"
import { ResetScreen } from "./features/onboarding/ResetScreen"
import { WelcomeScreen } from "./features/onboarding/WelcomeScreen"
import { BackupDownloadScreen } from "./features/recovery/BackupDownloadScreen"
import { BackupRecoveryScreen } from "./features/recovery/BackupRecoveryScreen"
import { RecoverySetupScreen } from "./features/recovery/RecoverySetupScreen"
import { SeedRecoveryConfirmScreen } from "./features/recovery/SeedRecoveryConfirmScreen"
import { SeedRecoveryPasswordScreen } from "./features/recovery/SeedRecoveryPasswordScreen"
import { SeedRecoveryScreen } from "./features/recovery/SeedRecoveryScreen"
import { SeedRecoverySetupScreen } from "./features/recovery/SeedRecoverySetupScreen"
import { DappConnectionsSettingsScreen } from "./features/settings/DappConnectionsSettingsScreen"
import { NetworkSettingsEditScreen } from "./features/settings/NetworkSettingsEditScreen"
import { NetworkSettingsFormScreen } from "./features/settings/NetworkSettingsFormScreen"
import { NetworkSettingsScreen } from "./features/settings/NetworkSettingsScreen"
import { SettingsScreen } from "./features/settings/SettingsScreen"
import { useEntry } from "./hooks/useEntry"
import { useTransactionErrorScreen } from "./hooks/useTransactionErrorScreen"
import { routes } from "./routes"
import { AccountScreen } from "./screens/AccountScreen"
import { ErrorScreen } from "./screens/ErrorScreen"
import { LoadingScreen } from "./screens/LoadingScreen"
import { NetworkWarningScreen } from "./screens/NetworkWarningScreen"
import { UpgradeScreen } from "./screens/UpgradeScreen"
import { useAppState } from "./states/app"

export const ScrollBehaviour = styled.div`
  height: 100vh;
  overflow-y: auto;

  overscroll-behavior: none;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const Viewport: FC = () => (
  <ScrollBehaviour>
    <Outlet />
  </ScrollBehaviour>
)

// Routes which don't need an unlocked wallet
const nonWalletRoutes = (
  <>
    <Route path={routes.welcome.path} element={<WelcomeScreen />} />
    <Route path={routes.newWallet.path} element={<NewWalletScreen />} />
    <Route
      path={routes.backupRecovery.path}
      element={<BackupRecoveryScreen />}
    />
    <Route path={routes.seedRecovery.path} element={<SeedRecoveryScreen />} />
    <Route
      path={routes.seedRecoveryPassword.path}
      element={<SeedRecoveryPasswordScreen />}
    />
    <Route path={routes.lockScreen.path} element={<LockScreen />} />
    <Route path={routes.reset.path} element={<ResetScreen />} />
    <Route path={routes.disclaimer.path} element={<DisclaimerScreen />} />
    <Route path={routes.legacy.path} element={<LegacyScreen />} />
    <Route path={routes.error.path} element={<ErrorScreen />} />
  </>
)

// Routes which need an unlocked wallet and therefore can also sign actions
const walletRoutes = (
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
    <Route path={routes.accounts.path} element={<AccountListScreen />} />
    <Route path={routes.funding.path} element={<FundingScreen />} />
    <Route path={routes.fundingQrCode.path} element={<FundingQrCodeScreen />} />
    <Route
      path={routes.confirmSeedRecovery.path}
      element={<SeedRecoveryConfirmScreen />}
    />
    <Route
      path={routes.setupSeedRecovery.path}
      element={<SeedRecoverySetupScreen />}
    />
    <Route path={routes.setupRecovery.path} element={<RecoverySetupScreen />} />
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
      element={<NetworkSettingsEditScreen />}
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
)

export const AppRoutes: FC = () => {
  useEntry()
  useActionsSubscription()
  useTransactionErrorScreen()
  useTokensSubscription()

  useEffect(() => {
    migrateUiTokensToBackground()
  }, [])

  const { isLoading } = useAppState()
  const { actions } = useActions()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route element={<Viewport />}>
        {nonWalletRoutes}
        {actions[0] ? (
          <Route path="*" element={<ActionScreen />} />
        ) : (
          walletRoutes
        )}
      </Route>
    </Routes>
  )
}
