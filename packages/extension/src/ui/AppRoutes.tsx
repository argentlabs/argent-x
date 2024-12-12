import type { FC, ReactNode } from "react"
import { Suspense, isValidElement, useEffect, useMemo } from "react"
import type { Location } from "react-router-dom"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { Route, Routes, RoutesConfig } from "./router"

import { routes } from "../shared/ui/routes"
import { useMessageStreamHandler } from "./hooks/useMessageStreamHandler"
import { AppBackgroundError } from "./AppBackgroundError"
import { ResponsiveAppContainer } from "./components/Responsive"
import { SuspenseScreen } from "./components/SuspenseScreen"
import { ActivityDetailsScreenContainer } from "./features/accountActivity/ActivityDetailsScreenContainer"
import { CollectionNftsContainer } from "./features/accountNfts/CollectionNftsContainer"
import { NftScreenContainer } from "./features/accountNfts/NftScreenContainer"
import { AccountListHiddenScreenContainer } from "./features/accounts/AccountListHiddenScreenContainer"
import {
  AccountListScreenContainer,
  AccountListScreenContainerSkeleton,
} from "./features/accounts/AccountListScreenContainer"
import { RootTabsScreenContainer } from "./features/root/RootTabsScreenContainer"
import { AddNewAccountScreenContainer } from "./features/accounts/AddNewAccountScreenContainer"
import { HideOrDeleteAccountConfirmScreenContainer } from "./features/accounts/HideOrDeleteAccountConfirmScreenContainer"
import { HideTokenScreenContainer } from "./features/accountTokens/HideTokenScreenContainer"
import { AccountDeprecatedModal } from "./features/accountTokens/warning/AccountDeprecatedModal"
import { AccountOwnerWarningScreen } from "./features/accountTokens/warning/AccountOwnerWarningScreen"
import { ActionScreenContainer } from "./features/actions/ActionScreenContainer"
import { AddTokenScreenContainer } from "./features/actions/AddTokenScreenContainer"
import { ErrorScreenContainer } from "./features/actions/ErrorScreenContainer"
import { LoadingScreenContainer } from "./features/actions/LoadingScreenContainer"
import { ArgentAccountEmailScreen } from "./features/argentAccount/ArgentAccountEmailScreen"
import { ArgentAccountLoggedInScreenContainer } from "./features/argentAccount/ArgentAccountLoggedInScreenContainer"
import { FundingBridgeScreen } from "./features/funding/FundingBridgeScreen"
import { FundingFaucetFallbackScreen } from "./features/funding/FundingFaucetFallbackScreen"
import { FundingFaucetSepoliaScreen } from "./features/funding/FundingFaucetSepoliaScreen"
import { FundingProviderScreen } from "./features/funding/FundingProviderScreen"
import { FundingQrCodeScreenContainer } from "./features/funding/FundingQrCodeScreenContainer"
import { FundingScreen } from "./features/funding/FundingScreen"
import { LedgerStartScreen } from "./features/ledger/LedgerStartScreen"
import { ResetScreen } from "./features/lock/ResetScreen"
import { CreateMultisigStartScreen } from "./features/multisig/CreateMultisigScreen/CreateMultisigStartScreen"
import { JoinMultisigScreen } from "./features/multisig/JoinMultisigScreen"
import { JoinMultisigSettingsScreen } from "./features/multisig/JoinMultisigSettingsScreen"
import { MultisigAddOwnersScreen } from "./features/multisig/MultisigAddOwnersScreen"
import { MultisigConfirmationsScreen } from "./features/multisig/MultisigConfirmationsScreen"
import { MultisigOwnersScreen } from "./features/multisig/MultisigOwnersScreen"
import { MultisigPendingOffchainSignatureDetailsScreen } from "./features/multisig/MultisigPendingOffchainSignatureDetailsScreen"
import { MultisigPendingTransactionDetailsScreen } from "./features/multisig/MultisigPendingTransactionDetailsScreen"
import { MultisigRemoveOwnersScreen } from "./features/multisig/MultisigRemoveOwnerScreen"
import { MultisigReplaceOwnerScreen } from "./features/multisig/MultisigReplaceOwnerScreen"
import { MultisigSignatureScreenWarningV2 } from "./features/multisig/MultisigSignatureScreenWarning"
import { MultisigSignerSelectionScreen } from "./features/multisig/MultisigSignerSelectionScreen"
import { MultisigTransactionConfirmationsScreenContainer } from "./features/multisig/MultisigTransactionConfirmationsScreenContainer"
import { NewMultisigScreen } from "./features/multisig/NewMultisigScreen"
import { RemovedMultisigSettingsScreenContainer } from "./features/multisig/RemovedMultisigSettingsScreenContainer"
import { NetworkWarningScreenContainer } from "./features/networks/NetworkWarningScreen/NetworkWarningScreenContainer"
import { OnboardingAccountTypeContainer } from "./features/onboarding/OnboardingAccountTypeScreenContainer"
import { OnboardingFinishScreenContainer } from "./features/onboarding/OnboardingFinishScreenContainer"
import { OnboardingPasswordScreenContainer } from "./features/onboarding/OnboardingPasswordScreenContainer"
import { OnboardingPrivacyScreenContainer } from "./features/onboarding/OnboardingPrivacyScreenContainer"
import { OnboardingRestoreBackupScreenContainer } from "./features/onboarding/OnboardingRestoreBackupScreenContainer"
import { OnboardingRestorePasswordScreenContainer } from "./features/onboarding/OnboardingRestorePasswordScreenContainer"
import { OnboardingRestoreSeedScreenContainer } from "./features/onboarding/OnboardingRestoreSeedScreenContainer"
import { OnboardingSmartAccountEmailScreenContainer } from "./features/onboarding/OnboardingSmartAccountEmailScreenContainer"
import { OnboardingSmartAccountOTPScreenContainer } from "./features/onboarding/OnboardingSmartAccountOTPScreenContainer"
import { OnboardingStartScreenContainer } from "./features/onboarding/OnboardingStartScreenContainer"
import { RecoverySetupScreen } from "./features/recovery/RecoverySetupScreen"
import { SeedRecoverySetupScreen } from "./features/recovery/SeedRecoverySetupScreen"
import { SendAmountAndAssetScreenContainer } from "./features/send/SendAmountAndAssetScreenContainer"
import { SendAssetScreen } from "./features/send/SendAssetScreen"
import { SendCollectionNftsScreenContainer } from "./features/send/SendCollectionNftsScreenContainer"
import { SendRecipientScreenContainer } from "./features/send/SendRecipientScreenContainer"
import { AccountSettingsScreen } from "./features/settings/account/AccountSettingsScreen"
import { ChangeAccountImplementationScreen } from "./features/settings/account/ChangeAccountImplementationScreen"
import { ExportPrivateKeyScreenContainer } from "./features/settings/account/ExportPrivateKeyScreenContainer"
import { ExportPublicKeyScreen } from "./features/settings/account/ExportPublicKeyScreen"
import { AddressBookAddOrEditScreenContainer } from "./features/settings/addressBook/AddressBookAddOrEditScreenContainer"
import { AddressBookSettingsScreenContainer } from "./features/settings/addressBook/AddressBookSettingsScreenContainer"
import { DappConnectionsAccountListScreenContainer } from "./features/settings/connectedDapps/DappConnectionsAccountListScreenContainer"
import { DappConnectionsAccountScreenContainer } from "./features/settings/connectedDapps/DappConnectionsAccountScreenContainer"
import { BetaFeaturesSettingsScreenContainer } from "./features/settings/advanced/betaFeatures/BetaFeaturesSettingsScreenContainer"
import { ClearLocalStorageScreen } from "./features/settings/advanced/clearLocalStorage/ClearLocalStorageScreen"
import { DeploymentDataScreen } from "./features/settings/advanced/deploymentData/DeploymentDataScreen"
import { AdvancedSettingsScreenContainer } from "./features/settings/advanced/AdvancedSettingsScreenContainer"
import { DownloadLogsScreen } from "./features/settings/advanced/downloadLogs/DownloadLogsScreen"
import { ExperimentalSettingsScreenContainer } from "./features/settings/advanced/experimental/ExperimentalSettingsScreenContainer"
import { NetworkSettingsEditScreen } from "./features/settings/advanced/manageNetworks/NetworkSettingsEditScreen"
import { NetworkSettingsFormScreenContainer } from "./features/settings/advanced/manageNetworks/NetworkSettingsFormScreenContainer"
import { NetworkSettingsScreenContainer } from "./features/settings/advanced/manageNetworks/NetworkSettingsScreenContainer"
import { BlockExplorerSettingsScreenContainer } from "./features/settings/preferences/BlockExplorerSettingsScreenContainer"
import { NftMarketplaceSettingsScreenContainer } from "./features/settings/preferences/NftMarketplaceSettingsScreenContainer"
import { PreferencesSettingsContainer } from "./features/settings/preferences/PreferencesSettingsContainer"
import { AutoLockTimerSettingsScreenContainer } from "./features/settings/securityAndRecovery/AutoLockTimerSettingsScreenContainer"
import { BeforeYouContinueScreen } from "./features/settings/securityAndRecovery/BeforeYouContinueScreen"
import { SecurityAndRecoverySettingsScreenContainer } from "./features/settings/securityAndRecovery/SecurityAndRecoverySettingsScreenContainer"
import { PrivacySettingsScreenContainer } from "./features/settings/privacy/PrivacySettingsScreenContainer"
import { SeedSettingsScreenContainer } from "./features/settings/securityAndRecovery/SeedSettingsScreenContainer"
import { SettingsScreenContainer } from "./features/settings/SettingsScreenContainer"
import { CreateSmartAccountEmailScreen } from "./features/smartAccount/CreateSmartAccountEmailScreen"
import { CreateSmartAccountOTPScreen } from "./features/smartAccount/CreateSmartAccountOTPScreen"
import { EscapeWarningScreen } from "./features/smartAccount/escape/EscapeWarningScreen"
import { SmartAccountActionScreen } from "./features/smartAccount/SmartAccountActionScreen"
import { SmartAccountFinishScreen } from "./features/smartAccount/SmartAccountFinishScreen"
import { SmartAccountOTPScreen } from "./features/smartAccount/SmartAccountOTPScreen"
import { SmartAccountStartScreen } from "./features/smartAccount/SmartAccountStartScreen"
import { WithSmartAccountVerified } from "./features/smartAccount/WithSmartAccountVerified"
import { ReviewFeedbackScreenContainer } from "./features/userReview/ReviewFeedbackScreenContainer"
import { ReviewRatingScreen } from "./features/userReview/ReviewRatingScreen"
import { useOnAppRoutesAnimationComplete } from "./hooks/useOnAppRoutesAnimationComplete"
import { useClientUINavigate } from "./services/ui/useClientUINavigate"
import { hasActionsView } from "./views/actions"
import { useView } from "./views/implementation/react"
import { isClearingStorageView, isRecoveringView } from "./views/recovery"
import { ImportPrivateKeyScreen } from "./features/importedAccounts/ImportPrivateKeyScreen"
import { AirGapReviewScreen } from "./features/actions/transaction/airgap/AirGapReviewScreen"
import {
  RouteWithLockScreen,
  WithLockScreen,
} from "./features/lock/WithLockScreen"
import { useIsOnboardingComplete } from "./hooks/appState"
import { routerService } from "./services/router"
import { useClientUIShowNotification } from "./services/ui/useClientUIShowNotification"
import { TokenDetailsScreen } from "./features/tokenDetails/TokenDetailsScreen"
import { HiddenAndSpamTokensScreenContainer } from "./features/accountTokens/HiddenAndSpamTokensScreenContainer"
import { SwapScreenContainer } from "./features/swap/SwapScreenContainer"
import { StakingScreenContainer } from "./features/defi/staking/StakingScreenContainer"
import { NativeStakingScreenContainer } from "./features/defi/staking/NativeStakingScreenContainer"
import { NativeStakingProviderSelectScreenContainer } from "./features/defi/staking/NativeStakingProviderSelectScreenContainer"
import { UnstakingScreenContainer } from "./features/defi/staking/UnstakingScreenContainer"
import { DefiPositionDetailsScreenContainer } from "./features/defi/defiDecomposition/positionDetails/DefiPositionDetailsScreenContainer"
import { LiquidStakingProviderSelectScreenContainer } from "./features/defi/staking/LiquidStakingProviderSelectScreenContainer"
import { IdProviderSettingsScreenContainer } from "./features/settings/preferences/IdProviderSettingsScreenContainer"

interface LocationWithState extends Location {
  state: {
    showOnTop?: boolean // flag to indicate a particular route will be shown on top of actions
  }
}

const ResponsiveRoutes: FC = () => (
  <ResponsiveAppContainer>
    <Outlet />
  </ResponsiveAppContainer>
)

// Routes which don't need an unlocked wallet

const withoutLockScreenRoutes = (
  <>
    <Route
      path={routes.backgroundError.path}
      element={<AppBackgroundError />}
    />
    <Route path={routes.error.path} element={<ErrorScreenContainer />} />
    <Route path={routes.reset.path} element={<ResetScreen />} />
  </>
)

// Routes which need an unlocked wallet and therefore can also sign actions

const withLockScreenRoutes = (
  <Route element={<RouteWithLockScreen />}>
    <Route
      presentation="modal"
      path={routes.accountNft.path}
      element={
        <SuspenseScreen>
          <NftScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.collectionNfts.path}
      element={
        <SuspenseScreen>
          <CollectionNftsContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="modal"
      path={routes.networkWarning.path}
      element={<NetworkWarningScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.accountTokens.path}
      element={<RootTabsScreenContainer tab="tokens" />}
    />
    <Route
      presentation="push"
      path={routes.accountCollections.path}
      element={<RootTabsScreenContainer tab="collections" />}
    />
    <Route
      presentation="push"
      path={routes.accountActivity.path}
      element={<RootTabsScreenContainer tab="activity" />}
    />
    <Route
      presentation="push"
      path={routes.accountDiscover.path}
      element={<RootTabsScreenContainer tab="discover" />}
    />
    <Route
      presentation="modal"
      path={routes.accounts.path}
      element={
        <Suspense fallback={<AccountListScreenContainerSkeleton />}>
          <AccountListScreenContainer />
        </Suspense>
      }
    />
    <Route
      presentation="modal"
      path={routes.newAccount.path}
      element={<AddNewAccountScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.changeAccountImplementations.path}
      element={<ChangeAccountImplementationScreen />}
    />
    <Route
      presentation="push"
      path={routes.smartAccountStart.path}
      element={<SmartAccountStartScreen />}
    />
    <Route
      presentation="push"
      path={routes.argentAccountEmail.path}
      element={<ArgentAccountEmailScreen />}
    />
    <Route
      presentation="push"
      path={routes.argentAccountLoggedIn.path}
      element={
        <SuspenseScreen>
          <ArgentAccountLoggedInScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.smartAccountOTP.path}
      element={<SmartAccountOTPScreen />}
    />
    <Route
      presentation="push"
      path={routes.createSmartAccountEmail.path}
      element={<CreateSmartAccountEmailScreen />}
    />
    <Route
      presentation="push"
      path={routes.createSmartAccountOTP.path}
      element={<CreateSmartAccountOTPScreen />}
    />
    <Route
      presentation="push"
      path={routes.smartAccountAction.path}
      element={<SmartAccountActionScreen />}
    />
    <Route
      presentation="push"
      path={routes.smartAccountFinish.path}
      element={<SmartAccountFinishScreen />}
    />
    <Route
      path={routes.smartAccountEscapeWarning.path}
      element={<EscapeWarningScreen />}
    />
    <Route
      presentation="modal"
      path={routes.settings.path}
      element={
        <SuspenseScreen>
          <SettingsScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsAccount.path}
      element={
        <SuspenseScreen>
          <AccountSettingsScreen />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsPreferences.path}
      element={<PreferencesSettingsContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsSecurityAndRecovery.path}
      element={<SecurityAndRecoverySettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsPrivacy.path}
      element={<PrivacySettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsAddCustomNetwork.path}
      element={<NetworkSettingsFormScreenContainer mode="add" />}
    />
    <Route
      presentation="push"
      path={routes.settingsEditCustomNetwork.path}
      element={
        <SuspenseScreen>
          <NetworkSettingsEditScreen />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsBlockExplorer.path}
      element={<BlockExplorerSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsHiddenAndSpamTokens.path}
      element={<HiddenAndSpamTokensScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsNftMarketplace.path}
      element={<NftMarketplaceSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsIdProvider.path}
      element={<IdProviderSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsSeed.path}
      element={<SeedSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsAutoLockTimer.path}
      element={<AutoLockTimerSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsDappConnectionsAccountList.path}
      element={
        <SuspenseScreen list>
          <DappConnectionsAccountListScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsDappConnectionsAccount.path}
      element={
        <SuspenseScreen list>
          <DappConnectionsAccountScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsAddressBook.path}
      element={
        /** TODO: Suspense here prevents fallback while views initialise - refactor to use shared default fallback */
        <SuspenseScreen>
          <AddressBookSettingsScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsAddressBookAddOrEdit.path}
      element={
        <SuspenseScreen>
          <AddressBookAddOrEditScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsAdvanced.path}
      element={<AdvancedSettingsScreenContainer />}
    />

    <Route
      presentation="push"
      path={routes.settingsClearLocalStorage.path}
      element={<ClearLocalStorageScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsDownloadLogs.path}
      element={<DownloadLogsScreen />}
    />
    <Route
      presentation="push"
      path={routes.deploymentData.path}
      element={<DeploymentDataScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsExperimental.path}
      element={<ExperimentalSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsBetaFeatures.path}
      element={<BetaFeaturesSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsNetworks.path}
      element={<NetworkSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.transactionDetail.path}
      element={
        <SuspenseScreen list>
          <ActivityDetailsScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.accountHideOrDeleteConfirm.path}
      element={<HideOrDeleteAccountConfirmScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.hideToken.path}
      element={<HideTokenScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.sendRecipientScreen.path}
      element={
        <SuspenseScreen>
          <SendRecipientScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="modal"
      path={routes.sendAddressBookEdit.path}
      element={
        <SuspenseScreen>
          <AddressBookAddOrEditScreenContainer
            modal
            addressDisabled
            networkDisabled
          />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.sendAmountAndAssetScreen.path}
      element={
        <SuspenseScreen>
          <WithSmartAccountVerified>
            <SendAmountAndAssetScreenContainer />
          </WithSmartAccountVerified>
        </SuspenseScreen>
      }
    />
    <Route
      presentation="modal"
      path={routes.sendAssetScreen.path}
      element={
        <SuspenseScreen>
          <SendAssetScreen />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.tokenDetails.path}
      element={
        <SuspenseScreen>
          <TokenDetailsScreen />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.swapToken.path}
      element={
        <SuspenseScreen>
          <SwapScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.sendCollectionsNftsScreen.path}
      element={
        <SuspenseScreen>
          <SendCollectionNftsScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="modal"
      path={routes.accountDeprecated.path}
      element={<AccountDeprecatedModal />}
    />
    <Route
      presentation="modal"
      path={routes.accountOwnerWarning.path}
      element={<AccountOwnerWarningScreen />}
    />
    <Route
      presentation="push"
      path={routes.accountsHidden.path}
      element={
        <SuspenseScreen>
          <AccountListHiddenScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation={"modal"}
      path={routes.funding.path}
      element={<FundingScreen />}
    />
    <Route
      presentation="push"
      path={routes.fundingBridge.path}
      element={<FundingBridgeScreen />}
    />
    <Route
      presentation="push"
      path={routes.fundingQrCode.path}
      element={<FundingQrCodeScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.fundingProvider.path}
      element={<FundingProviderScreen />}
    />
    <Route
      presentation="push"
      path={routes.fundingFaucetFallback.path}
      element={<FundingFaucetFallbackScreen />}
    />
    <Route
      presentation="push"
      path={routes.fundingFaucetSepolia.path}
      element={<FundingFaucetSepoliaScreen />}
    />
    <Route
      path={routes.setupSeedRecovery.path}
      element={<SeedRecoverySetupScreen />}
    />
    <Route path={routes.setupRecovery.path} element={<RecoverySetupScreen />} />
    <Route
      presentation="push"
      path={routes.newToken.path}
      element={
        <SuspenseScreen>
          <AddTokenScreenContainer />
        </SuspenseScreen>
      }
    />

    <Route
      presentation="push"
      path={routes.exportPrivateKey.path}
      element={<ExportPrivateKeyScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.exportPublicKey.path}
      element={<ExportPublicKeyScreen />}
    />
    {/* Multisig */}
    <Route path={routes.multisigNew.path} element={<NewMultisigScreen />} />
    <Route
      path={routes.multisigSignerSelection.path}
      element={<MultisigSignerSelectionScreen />}
      presentation="push"
    />
    <Route
      presentation="push"
      path={routes.multisigJoin.path}
      element={<JoinMultisigScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigJoinSettings.path}
      element={<JoinMultisigSettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigOwners.path}
      element={<MultisigOwnersScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigConfirmations.path}
      element={<MultisigConfirmationsScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigAddOwners.path}
      element={<MultisigAddOwnersScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigRemoveOwners.path}
      element={<MultisigRemoveOwnersScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigReplaceOwner.path}
      element={<MultisigReplaceOwnerScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigPendingTransactionDetails.path}
      element={
        <SuspenseScreen>
          <MultisigPendingTransactionDetailsScreen />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.multisigTransactionConfirmations.path}
      element={
        <SuspenseScreen>
          <MultisigTransactionConfirmationsScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.multisigRemovedSettings.path}
      element={<RemovedMultisigSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.multisigPendingOffchainSignatureDetails.path}
      element={<MultisigPendingOffchainSignatureDetailsScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigOffchainSignatureWarning.path}
      element={<MultisigSignatureScreenWarningV2 />}
    />
    <Route
      presentation="push"
      path={routes.beforeYouContinue.path}
      element={<BeforeYouContinueScreen />}
    />
    <Route
      presentation="modal"
      path={routes.privateKeyImport.path}
      element={<ImportPrivateKeyScreen />}
    />

    {/* Staking */}
    <Route
      path={routes.staking.path}
      presentation="push"
      element={
        <SuspenseScreen>
          <StakingScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      path={routes.nativeStakingIndex.path}
      presentation="push"
      element={
        <SuspenseScreen>
          <NativeStakingScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      path={routes.nativeStaking.path}
      presentation="push"
      element={
        <SuspenseScreen>
          <NativeStakingScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      path={routes.nativeStakingSelect.path}
      presentation="modal"
      element={
        <SuspenseScreen>
          <NativeStakingProviderSelectScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      path={routes.liquidStakingSelect.path}
      presentation="push"
      element={
        <SuspenseScreen>
          <LiquidStakingProviderSelectScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      path={routes.unstake.path}
      element={<UnstakingScreenContainer />}
      presentation="push"
    />

    {/* Defi */}
    <Route
      path={routes.defiPositionDetails.path}
      element={
        <SuspenseScreen>
          <DefiPositionDetailsScreenContainer />
        </SuspenseScreen>
      }
      presentation="push"
    />
  </Route>
)

const fullscreenRoutes = (
  <>
    <Route
      path={routes.onboardingStart.path}
      element={<OnboardingStartScreenContainer />}
    />
    <Route
      path={routes.onboardingPrivacy.path}
      element={<OnboardingPrivacyScreenContainer />}
    />
    <Route
      path={routes.onboardingPassword.path}
      element={<OnboardingPasswordScreenContainer />}
    />
    <Route
      path={routes.onboardingRestoreBackup.path}
      element={<OnboardingRestoreBackupScreenContainer />}
    />
    <Route
      path={routes.onboardingRestoreSeed.path}
      element={<OnboardingRestoreSeedScreenContainer />}
    />
    <Route
      path={routes.onboardingRestorePassword.path}
      element={<OnboardingRestorePasswordScreenContainer />}
    />
    <Route
      path={routes.onboardingFinish.path}
      element={<OnboardingFinishScreenContainer />}
    />
    <Route
      path={routes.onboardingAccountType.path}
      element={<OnboardingAccountTypeContainer />}
    />
    <Route
      path={routes.onboardingSmartAccountEmail.path}
      element={<OnboardingSmartAccountEmailScreenContainer />}
    />
    <Route
      path={routes.onboardingSmartAccountOTP.path}
      element={<OnboardingSmartAccountOTPScreenContainer />}
    />
    <Route path={routes.userReview.path} element={<ReviewRatingScreen />} />
    <Route
      path={routes.userReviewFeedback.path}
      element={<ReviewFeedbackScreenContainer />}
    />
    <Route
      path={routes.multisigCreate.path}
      element={<CreateMultisigStartScreen />}
    />
    <Route path={routes.ledgerConnect.path} element={<LedgerStartScreen />} />
    <Route path={routes.airGapReview.path} element={<AirGapReviewScreen />} />
  </>
)

/** Make a list of non-wallet routes which will show in place of actions */
export const nonWalletPaths = withoutLockScreenRoutes.props.children.flatMap(
  (child: ReactNode) => {
    return isValidElement(child) ? child.props.path : []
  },
)

export const AppRoutes: FC = () => {
  useClientUINavigate()
  useMessageStreamHandler()
  const location = useLocation()
  const { state, pathname } = location as LocationWithState
  const onAppRoutesAnimationComplete = useOnAppRoutesAnimationComplete()
  const hasActions = useView(hasActionsView)
  const isRecovering = useView(isRecoveringView)
  const isClearingStorage = useView(isClearingStorageView)
  const isOnboardingComplete = useIsOnboardingComplete()
  useClientUIShowNotification(pathname)

  const query = new URLSearchParams(window.location.search)
  const { entry: initialRoute, options = {} } = routerService.getInitialRoute({
    query,
    isOnboardingComplete,
  })

  /** remove the initial style overrides in index.html */
  useEffect(() => {
    document.documentElement.removeAttribute("style")
    document.body.removeAttribute("style")
  }, [])

  /** TODO: refactor: this should maybe be invoked by service + worker pattern */
  const showOnTop = state?.showOnTop || options?.state?.showOnTop

  const showActions = useMemo(() => {
    const isNonWalletRoute = nonWalletPaths.includes(pathname) || showOnTop
    return hasActions && !isNonWalletRoute
  }, [hasActions, pathname, showOnTop])

  if (isClearingStorage) {
    return <LoadingScreenContainer loadingTexts={["Clearing storage..."]} />
  }
  if (isRecovering && !isClearingStorage) {
    return <LoadingScreenContainer loadingTexts={["Recovering accounts..."]} />
  }

  if (showActions) {
    return (
      <ResponsiveAppContainer>
        <WithLockScreen>
          <ActionScreenContainer />
        </WithLockScreen>
      </ResponsiveAppContainer>
    )
  }

  return (
    <RoutesConfig
      defaultPresentation="replace"
      onExitComplete={onAppRoutesAnimationComplete}
    >
      <Routes>
        <Route element={<ResponsiveRoutes />}>
          {withoutLockScreenRoutes}
          {withLockScreenRoutes}
        </Route>
        {fullscreenRoutes}
        {/** immediately render initial route and screen */}
        <Route
          path="/index.html"
          element={<Navigate to={initialRoute} replace {...options} />}
        />
      </Routes>
    </RoutesConfig>
  )
}
