import { chakra } from "@chakra-ui/system"
import { FC } from "react"
import { Outlet, Route, Routes } from "react-router-dom"

import { useAppState } from "./app.state"
import { ResponsiveBox } from "./components/Responsive"
import { TransactionDetailScreen } from "./features/accountActivity/TransactionDetailScreen"
import { AccountEditScreen } from "./features/accountEdit/AccountEditScreen"
import { CollectionNfts } from "./features/accountNfts/CollectionNfts"
import { NftScreen } from "./features/accountNfts/NftScreen"
import { SendNftScreen } from "./features/accountNfts/SendNftScreen"
import { AddPluginScreen } from "./features/accountPlugins.tsx/AddPluginScreen"
import { AccountListHiddenScreen } from "./features/accounts/AccountListHiddenScreen"
import { AccountListScreen } from "./features/accounts/AccountListScreen"
import { AccountScreen } from "./features/accounts/AccountScreen"
import { HideOrDeleteAccountConfirmScreen } from "./features/accounts/HideOrDeleteAccountConfirmScreen"
import { UpgradeScreen } from "./features/accounts/UpgradeScreen"
import { UpgradeScreenV4 } from "./features/accounts/UpgradeScreenV4"
import { ExportPrivateKeyScreen } from "./features/accountTokens/ExportPrivateKeyScreen"
import { HideTokenScreen } from "./features/accountTokens/HideTokenScreen"
import { SendTokenScreen } from "./features/accountTokens/SendTokenScreen"
import { TokenScreen } from "./features/accountTokens/TokenScreen"
import { useActions } from "./features/actions/actions.state"
import { ActionScreen } from "./features/actions/ActionScreen"
import { AddTokenScreen } from "./features/actions/AddTokenScreen"
import { ErrorScreen } from "./features/actions/ErrorScreen"
import { LoadingScreen } from "./features/actions/LoadingScreen"
import { FundingBridgeScreen } from "./features/funding/FundingBridgeScreen"
import { FundingProviderScreen } from "./features/funding/FundingProviderScreen"
import { FundingQrCodeScreen } from "./features/funding/FundingQrCodeScreen"
import { FundingScreen } from "./features/funding/FundingScreen"
import { LockScreen } from "./features/lock/LockScreen"
import { ResetScreen } from "./features/lock/ResetScreen"
import { NetworkWarningScreen } from "./features/networks/NetworkWarningScreen"
import { MigrationDisclaimerScreen } from "./features/onboarding/MigrationDisclaimerScreen"
import { OnboardingDisclaimerScreen } from "./features/onboarding/OnboardingDisclaimerScreen"
import { OnboardingFinishScreen } from "./features/onboarding/OnboardingFinishScreen"
import { OnboardingPasswordScreen } from "./features/onboarding/OnboardingPasswordScreen"
import { OnboardingPrivacyStatementScreen } from "./features/onboarding/OnboardingPrivacyStatementScreen"
import { OnboardingRestoreBackup } from "./features/onboarding/OnboardingRestoreBackup"
import { OnboardingRestorePassword } from "./features/onboarding/OnboardingRestorePassword"
import { OnboardingRestoreSeed } from "./features/onboarding/OnboardingRestoreSeed"
import { OnboardingStartScreen } from "./features/onboarding/OnboardingStartScreen"
import { BackupDownloadScreen } from "./features/recovery/BackupDownloadScreen"
import { RecoverySetupScreen } from "./features/recovery/RecoverySetupScreen"
import { SeedRecoveryConfirmScreen } from "./features/recovery/SeedRecoveryConfirmScreen"
import { SeedRecoverySetupScreen } from "./features/recovery/SeedRecoverySetupScreen"
import { SendScreen } from "./features/send/SendScreen"
import { AddressbookAddOrEditScreen } from "./features/settings/AddressbookAddOrEditScreen"
import { AddressbookSettingsScreen } from "./features/settings/AddressbookSettingsScreen"
import { BlockExplorerSettingsScreen } from "./features/settings/BlockExplorerSettingsScreen"
import { DappConnectionsSettingsScreen } from "./features/settings/DappConnectionsSettingsScreen"
import { DeveloperSettings } from "./features/settings/DeveloperSettings"
import { DeclareOrDeployContractSuccess } from "./features/settings/DeveloperSettings/DeclareContractClasshash"
import { DeclareSmartContractScreen } from "./features/settings/DeveloperSettings/DeclareSmartContractScreen"
import { DeploySmartContractScreen } from "./features/settings/DeveloperSettings/DeploySmartContractScreen"
import { PrivacyExperimentalSettings } from "./features/settings/ExperimentalSettings"
import { NetworkSettingsEditScreen } from "./features/settings/NetworkSettingsEditScreen"
import { NetworkSettingsFormScreen } from "./features/settings/NetworkSettingsFormScreen"
import { NetworkSettingsScreen } from "./features/settings/NetworkSettingsScreen"
import { PrivacySettingsScreen } from "./features/settings/PrivacySettingsScreen"
import { SeedSettingsScreen } from "./features/settings/SeedSettingsScreen"
import { SettingsPrivacyStatementScreen } from "./features/settings/SettingsPrivacyStatementScreen"
import { SettingsScreen } from "./features/settings/SettingsScreen"
import { SmartContractDevelopmentScreen } from "./features/settings/SmartContractDevelopmentScreen"
import { ReviewFeedbackScreen } from "./features/userReview/ReviewFeedbackScreen"
import { ReviewRatingScreen } from "./features/userReview/ReviewRatingScreen"
import { routes } from "./routes"
import { useEntryRoute } from "./useEntryRoute"

const ResponsiveContainer = chakra(ResponsiveBox, {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100vh",
    overflowY: "hidden",
    overscrollBehavior: "none",
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
})

const ResponsiveRoutes: FC = () => (
  <ResponsiveContainer>
    <Outlet />
  </ResponsiveContainer>
)

// Routes which don't need an unlocked wallet

const nonWalletRoutes = (
  <>
    <Route path={routes.error.path} element={<ErrorScreen />} />
    <Route path={routes.lockScreen.path} element={<LockScreen />} />
    <Route path={routes.reset.path} element={<ResetScreen />} />
    <Route
      path={routes.migrationDisclaimer.path}
      element={<MigrationDisclaimerScreen />}
    />
  </>
)

// Routes which need an unlocked wallet and therefore can also sign actions

const walletRoutes = (
  <>
    <Route path={routes.accountNft.path} element={<NftScreen />} />
    <Route path={routes.collectionNfts.path} element={<CollectionNfts />} />
    <Route
      path={routes.networkWarning.path}
      element={<NetworkWarningScreen />}
    />
    <Route
      path={routes.accountTokens.path}
      element={<AccountScreen tab="tokens" />}
    />
    <Route
      path={routes.accountCollections.path}
      element={<AccountScreen tab="collections" />}
    />
    <Route
      path={routes.accountActivity.path}
      element={<AccountScreen tab="activity" />}
    />
    <Route path={routes.accounts.path} element={<AccountListScreen />} />
    <Route path={routes.editAccount.path} element={<AccountEditScreen />} />
    <Route path={routes.settings.path} element={<SettingsScreen />} />
    <Route
      path={routes.settingsPrivacy.path}
      element={<PrivacySettingsScreen />}
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
      path={routes.settingsBlockExplorer.path}
      element={<BlockExplorerSettingsScreen />}
    />
    <Route path={routes.settingsSeed.path} element={<SeedSettingsScreen />} />
    <Route
      path={routes.settingsDappConnections.path}
      element={<DappConnectionsSettingsScreen />}
    />
    <Route
      path={routes.settingsAddressbook.path}
      element={<AddressbookSettingsScreen />}
    />
    <Route
      path={routes.settingsAddressbookAdd.path}
      element={<AddressbookAddOrEditScreen />}
    />
    <Route
      path={routes.settingsAddressbookEdit.path}
      element={<AddressbookAddOrEditScreen />}
    />
    <Route
      path={routes.settingsDeveloper.path}
      element={<DeveloperSettings />}
    />
    <Route
      path={routes.settingsSmartContractDevelopment.path}
      element={<SmartContractDevelopmentScreen />}
    />
    <Route
      path={routes.settingsSmartContractDeclare.path}
      element={<DeclareSmartContractScreen />}
    />
    <Route
      path={routes.settingsSmartContractDeploy.path}
      element={<DeploySmartContractScreen />}
    />
    <Route
      path={routes.settingsSmartContractDeclareOrDeploySuccess.path}
      element={<DeclareOrDeployContractSuccess />}
    />
    <Route
      path={routes.settingsExperimental.path}
      element={<PrivacyExperimentalSettings />}
    />
    <Route
      path={routes.settingsNetworks.path}
      element={<NetworkSettingsScreen />}
    />
    <Route
      path={routes.settingsPrivacyStatement.path}
      element={<SettingsPrivacyStatementScreen />}
    />
    <Route
      path={routes.transactionDetail.path}
      element={<TransactionDetailScreen />}
    />
    <Route
      path={routes.accountHideConfirm.path}
      element={<HideOrDeleteAccountConfirmScreen mode="hide" />}
    />
    <Route
      path={routes.accountDeleteConfirm.path}
      element={<HideOrDeleteAccountConfirmScreen mode="delete" />}
    />
    <Route path={routes.upgrade.path} element={<UpgradeScreen />} />
    <Route path={routes.hideToken.path} element={<HideTokenScreen />} />
    <Route path={routes.sendScreen.path} element={<SendScreen />} />
    <Route path={routes.sendToken.path} element={<SendTokenScreen />} />
    <Route path={routes.sendNft.path} element={<SendNftScreen />} />
    <Route
      path={routes.networkUpgradeV4.path}
      element={<UpgradeScreenV4 upgradeType={"network"} />}
    />
    <Route
      path={routes.accountUpgradeV4.path}
      element={<UpgradeScreenV4 upgradeType={"account"} />}
    />
    <Route
      path={routes.accountsHidden.path}
      element={<AccountListHiddenScreen />}
    />
    <Route path={routes.funding.path} element={<FundingScreen />} />
    <Route path={routes.fundingBridge.path} element={<FundingBridgeScreen />} />
    <Route path={routes.fundingQrCode.path} element={<FundingQrCodeScreen />} />
    <Route
      path={routes.fundingProvider.path}
      element={<FundingProviderScreen />}
    />
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
    <Route path={routes.addPlugin.path} element={<AddPluginScreen />} />
    <Route
      path={routes.backupDownload.path}
      element={<BackupDownloadScreen />}
    />
    <Route
      path={routes.exportPrivateKey.path}
      element={<ExportPrivateKeyScreen />}
    />
  </>
)

const fullscreenRoutes = (
  <>
    <Route
      path={routes.onboardingStart.path}
      element={<OnboardingStartScreen />}
    />
    <Route
      path={routes.onboardingDisclaimer.path}
      element={<OnboardingDisclaimerScreen />}
    />
    <Route
      path={routes.onboardingPrivacyStatement.path}
      element={<OnboardingPrivacyStatementScreen />}
    />
    <Route
      path={routes.onboardingPassword.path}
      element={<OnboardingPasswordScreen />}
    />
    <Route
      path={routes.onboardingRestoreBackup.path}
      element={<OnboardingRestoreBackup />}
    />
    <Route
      path={routes.onboardingRestoreSeed.path}
      element={<OnboardingRestoreSeed />}
    />
    <Route
      path={routes.onboardingRestorePassword.path}
      element={<OnboardingRestorePassword />}
    />
    <Route
      path={routes.onboardingFinish.path}
      element={<OnboardingFinishScreen />}
    />
    <Route path={routes.userReview.path} element={<ReviewRatingScreen />} />
    <Route
      path={routes.userReviewFeedback.path}
      element={<ReviewFeedbackScreen />}
    />
  </>
)

export const AppRoutes: FC = () => {
  useEntryRoute()

  const { isLoading } = useAppState()
  const actions = useActions()

  if (isLoading) {
    return <LoadingScreen />
  }

  const hasActions = !!actions[0]

  return (
    <Routes>
      <Route element={<ResponsiveRoutes />}>
        {nonWalletRoutes}
        {hasActions ? (
          <Route path="*" element={<ActionScreen />} />
        ) : (
          walletRoutes
        )}
      </Route>
      {fullscreenRoutes}
    </Routes>
  )
}
