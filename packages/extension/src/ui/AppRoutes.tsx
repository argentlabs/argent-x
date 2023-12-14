import { Route, Routes, RoutesConfig } from "@argent/stack-router"
import { chakra } from "@chakra-ui/react"
import { FC, ReactNode, isValidElement, useMemo } from "react"
// import { Outlet, Route, Routes } from "react-router-dom" // reinstate in case of issues with @argent/stack-router
import { Location, Outlet, useLocation } from "react-router-dom"

import { useAppState, useMessageStreamHandler } from "./app.state"
import { ResponsiveBox } from "./components/Responsive"
import { TransactionDetailScreen } from "./features/accountActivity/TransactionDetailScreen"
import { AccountEditScreen } from "./features/accountEdit/AccountEditScreen"
import { CollectionNftsContainer } from "./features/accountNfts/CollectionNftsContainer"
import { NftScreenContainer } from "./features/accountNfts/NftScreenContainer"
import { AddPluginScreen } from "./features/accountPlugins.tsx/AddPluginScreen"
import { AccountDeprecatedModal } from "./features/accounts/AccountDeprecatedModal"
import { AccountListHiddenScreenContainer } from "./features/accounts/AccountListHiddenScreenContainer"
import { AccountListScreenContainer } from "./features/accounts/AccountListScreenContainer"
import { AccountScreen } from "./features/accounts/AccountScreen"
import { AddNewAccountScreenContainer } from "./features/accounts/AddNewAccountScreenContainer"
import { HideOrDeleteAccountConfirmScreenContainer } from "./features/accounts/HideOrDeleteAccountConfirmScreenContainer"
import { ExportPrivateKeyScreen } from "./features/accountTokens/ExportPrivateKeyScreen"
import { HideTokenScreenContainer } from "./features/accountTokens/HideTokenScreenContainer"
import { ActionScreenContainer } from "./features/actions/ActionScreen"
import { AddTokenScreenContainer } from "./features/actions/AddTokenScreenContainer"
import { ErrorScreenContainer } from "./features/actions/ErrorScreenContainer"
import { LoadingScreenContainer } from "./features/actions/LoadingScreenContainer"
import { FundingBridgeScreen } from "./features/funding/FundingBridgeScreen"
import { FundingFaucetFallbackScreen } from "./features/funding/FundingFaucetFallbackScreen"
import { FundingProviderScreen } from "./features/funding/FundingProviderScreen"
import { FundingScreen } from "./features/funding/FundingScreen"
import { LockScreen } from "./features/lock/LockScreen"
import { ResetScreen } from "./features/lock/ResetScreen"
import { CreateMultisigStartScreen } from "./features/multisig/CreateMultisigScreen/CreateMultisigStartScreen"
import { JoinMultisigScreen } from "./features/multisig/JoinMultisigScreen"
import { JoinMultisigSettingsScreen } from "./features/multisig/JoinMultisigSettingsScreen"
import { MultisigAddOwnersScreen } from "./features/multisig/MultisigAddOwnersScreen"
import { MultisigConfirmationsScreen } from "./features/multisig/MultisigConfirmationsScreen"
import { MultisigOwnersScreen } from "./features/multisig/MultisigOwnersScreen"
import { MultisigRemoveOwnersScreen } from "./features/multisig/MultisigRemoveOwnerScreen"
import { MultisigTransactionConfirmationsScreen } from "./features/multisig/MultisigTransactionConfirmationsScreen"
import { NewMultisigScreen } from "./features/multisig/NewMultisigScreen"
import { RemovedMultisigSettingsScreenContainer } from "./features/multisig/RemovedMultisigSettingsScreenContainer"
import { NetworkWarningScreenContainer } from "./features/networks/NetworkWarningScreen/NetworkWarningScreenContainer"
import { OnboardingDisclaimerScreenContainer } from "./features/onboarding/OnboardingDisclaimerScreenContainer"
import { OnboardingFinishScreenContainer } from "./features/onboarding/OnboardingFinishScreenContainer"
import { OnboardingPasswordScreenContainer } from "./features/onboarding/OnboardingPasswordScreenContainer"
import { OnboardingPrivacyStatementScreenContainer } from "./features/onboarding/OnboardingPrivacyStatementScreenContainer"
import { OnboardingRestoreBackupScreenContainer } from "./features/onboarding/OnboardingRestoreBackupScreenContainer"
import { OnboardingRestorePasswordScreenContainer } from "./features/onboarding/OnboardingRestorePasswordScreenContainer"
import { OnboardingRestoreSeedScreenContainer } from "./features/onboarding/OnboardingRestoreSeedScreenContainer"
import { OnboardingStartScreenContainer } from "./features/onboarding/OnboardingStartScreenContainer"
import { RecoverySetupScreen } from "./features/recovery/RecoverySetupScreen"
import { SeedRecoverySetupScreen } from "./features/recovery/SeedRecoverySetupScreen"
import { SendAmountAndAssetScreenContainer } from "./features/send/SendAmountAndAssetScreenContainer"
import { SendAssetScreen } from "./features/send/SendAssetScreen"
import { SendCollectionNftsScreenContainer } from "./features/send/SendCollectionNftsScreenContainer"
import { SendRecipientScreenContainer } from "./features/send/SendRecipientScreenContainer"
import { AddressBookAddOrEditScreenContainer } from "./features/settings/AddressBookAddOrEditScreenContainer"
import { AddressBookSettingsScreenContainer } from "./features/settings/AddressBookSettingsScreenContainer"
import { BeforeYouContinueScreen } from "./features/settings/BeforeYouContinueScreen"
import { BlockExplorerSettingsScreen } from "./features/settings/BlockExplorerSettingsScreen"
import { DappConnectionsSettingsScreen } from "./features/settings/DappConnectionsSettingsScreen"
import { DeveloperSettings } from "./features/settings/DeveloperSettings"
import { DeclareOrDeployContractSuccessScreenContainer } from "./features/settings/DeveloperSettings/DeclareOrDeployContractSuccessScreenContainer"
import { DeclareSmartContractScreen } from "./features/settings/DeveloperSettings/DeclareSmartContractScreen"
import { DeploySmartContractScreen } from "./features/settings/DeveloperSettings/DeploySmartContractScreen"
import { PrivacyExperimentalSettings } from "./features/settings/ExperimentalSettings"
import { NetworkSettingsEditScreen } from "./features/settings/NetworkSettingsEditScreen"
import { NetworkSettingsFormScreenContainer } from "./features/settings/NetworkSettingsFormScreenContainer"
import { NetworkSettingsScreen } from "./features/settings/NetworkSettingsScreen"
import { PrivacySettingsScreen } from "./features/settings/PrivacySettingsScreen"
import { SeedSettingsScreen } from "./features/settings/SeedSettingsScreen"
import { SettingsPrivacyStatementScreen } from "./features/settings/SettingsPrivacyStatementScreen"
import { SettingsScreen } from "./features/settings/SettingsScreen"
import { SmartContractDevelopmentScreen } from "./features/settings/SmartContractDevelopmentScreen"
import { EscapeWarningScreen } from "./features/shield/escape/EscapeWarningScreen"
import { ShieldAccountActionScreen } from "./features/shield/ShieldAccountActionScreen"
import { ShieldAccountFinishScreen } from "./features/shield/ShieldAccountFinishScreen"
import { ShieldAccountOTPScreen } from "./features/shield/ShieldAccountOTPScreen"
import { ShieldAccountStartScreen } from "./features/shield/ShieldAccountStartScreen"
import { WithArgentShieldVerified } from "./features/shield/WithArgentShieldVerified"
import { ReviewFeedbackScreen } from "./features/userReview/ReviewFeedbackScreen"
import { ReviewRatingScreen } from "./features/userReview/ReviewRatingScreen"
import { useOnAppRoutesAnimationComplete } from "./hooks/useOnAppRoutesAnimationComplete"
import { routes } from "./routes"
import { useEntryRoute } from "./useEntryRoute"
import { hasActionsView } from "./views/actions"
import { useView } from "./views/implementation/react"
import { ArgentAccountEmailScreen } from "./features/argentAccount/ArgentAccountEmailScreen"
import { ArgentAccountLoggedInScreenContainer } from "./features/argentAccount/ArgentAccountLoggedInScreenContainer"
import { ArgentAccountEmailNotificationsScreenContainer } from "./features/argentAccount/ArgentAccountEmailNotificationsScreenContainer"
import { MultisigPendingTransactionDetailsScreen } from "./features/multisig/MultisigPendingTransactionDetailsScreen"
import { SuspenseScreen } from "./components/SuspenseScreen"
// import { BetaFeaturesSettings } from "./features/settings/BetaFeatureSettings"
import { ChangeAccountImplementationScreen } from "./features/accountEdit/ChangeAccountImplementationScreen"
import { MultisigReplaceOwnerScreen } from "./features/multisig/MultisigReplaceOwnerScreen"
import { FundingQrCodeScreenContainer } from "./features/funding/FundingQrCodeScreenContainer"
import { AppBackgroundError } from "./AppBackgroundError"
import { isRecoveringView } from "./views/recovery"
import { BetaFeaturesSettings } from "./features/settings/BetaFeatureSettings"

interface LocationWithState extends Location {
  state: {
    showOnTop?: boolean // flag to indicate a particular route will be shown on top of actions
  }
}

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
    <Route path={"/index.html"} element={null} />
    <Route
      path={routes.backgroundError.path}
      element={<AppBackgroundError />}
    />
    <Route path={routes.error.path} element={<ErrorScreenContainer />} />
    <Route path={routes.lockScreen.path} element={<LockScreen />} />
    <Route path={routes.reset.path} element={<ResetScreen />} />
  </>
)

// Routes which need an unlocked wallet and therefore can also sign actions

const walletRoutes = (
  <>
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
      element={<AccountScreen tab="tokens" />}
    />
    <Route
      presentation="push"
      path={routes.accountCollections.path}
      element={<AccountScreen tab="collections" />}
    />
    <Route
      presentation="push"
      path={routes.swap.path}
      element={<AccountScreen tab="swap" />}
    />
    <Route
      presentation="push"
      path={routes.accountActivity.path}
      element={<AccountScreen tab="activity" />}
    />
    <Route
      presentation="modal"
      path={routes.accounts.path}
      element={
        <SuspenseScreen list>
          <AccountListScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="modal"
      path={routes.newAccount.path}
      element={<AddNewAccountScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.editAccount.path}
      element={<AccountEditScreen />}
    />
    <Route
      presentation="push"
      path={routes.changeAccountImplementations.path}
      element={<ChangeAccountImplementationScreen />}
    />
    <Route
      presentation="push"
      path={routes.shieldAccountStart.path}
      element={<ShieldAccountStartScreen />}
    />
    <Route
      presentation="push"
      path={routes.shieldAccountStart.path}
      element={<ShieldAccountStartScreen />}
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
      path={routes.argentAccountEmailPreferences.path}
      element={
        <SuspenseScreen>
          <ArgentAccountEmailNotificationsScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.shieldAccountOTP.path}
      element={<ShieldAccountOTPScreen />}
    />
    <Route
      presentation="push"
      path={routes.shieldAccountAction.path}
      element={<ShieldAccountActionScreen />}
    />
    <Route
      presentation="push"
      path={routes.shieldAccountFinish.path}
      element={<ShieldAccountFinishScreen />}
    />
    <Route
      path={routes.shieldEscapeWarning.path}
      element={<EscapeWarningScreen />}
    />
    <Route
      presentation="modal"
      path={routes.settings.path}
      element={
        <SuspenseScreen>
          <SettingsScreen />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsPrivacy.path}
      element={<PrivacySettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsAddCustomNetwork.path}
      element={<NetworkSettingsFormScreenContainer mode="add" />}
    />
    <Route
      presentation="push"
      path={routes.settingsEditCustomNetwork.path}
      element={<NetworkSettingsEditScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsBlockExplorer.path}
      element={<BlockExplorerSettingsScreen />}
    />
    <Route path={routes.settingsSeed.path} element={<SeedSettingsScreen />} />
    <Route
      presentation="push"
      path={routes.settingsDappConnections.path}
      element={<DappConnectionsSettingsScreen />}
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
        /** TODO: Suspense here prevents fallback while views initialise - refactor to use shared default  fallback */
        <SuspenseScreen>
          <AddressBookAddOrEditScreenContainer />
        </SuspenseScreen>
      }
    />
    <Route
      presentation="push"
      path={routes.settingsDeveloper.path}
      element={<DeveloperSettings />}
    />
    <Route
      presentation="push"
      path={routes.settingsSmartContractDevelopment.path}
      element={<SmartContractDevelopmentScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsSmartContractDeclare.path}
      element={<DeclareSmartContractScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsSmartContractDeploy.path}
      element={<DeploySmartContractScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsSmartContractDeclareOrDeploySuccess.path}
      element={<DeclareOrDeployContractSuccessScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.settingsExperimental.path}
      element={<PrivacyExperimentalSettings />}
    />
    <Route
      presentation="push"
      path={routes.settingsBetaFeatures.path}
      element={<BetaFeaturesSettings />}
    />
    <Route
      presentation="push"
      path={routes.settingsNetworks.path}
      element={<NetworkSettingsScreen />}
    />
    <Route
      presentation="push"
      path={routes.settingsPrivacyStatement.path}
      element={<SettingsPrivacyStatementScreen />}
    />
    <Route
      presentation="modal"
      path={routes.transactionDetail.path}
      element={<TransactionDetailScreen />}
    />
    <Route
      presentation="push"
      path={routes.accountHideConfirm.path}
      element={<HideOrDeleteAccountConfirmScreenContainer mode="hide" />}
    />
    <Route
      presentation="push"
      path={routes.accountDeleteConfirm.path}
      element={<HideOrDeleteAccountConfirmScreenContainer mode="delete" />}
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
      presentation="push"
      path={routes.sendAmountAndAssetScreen.path}
      element={
        <SuspenseScreen>
          <WithArgentShieldVerified>
            <SendAmountAndAssetScreenContainer />
          </WithArgentShieldVerified>
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
      presentation="push"
      path={routes.accountsHidden.path}
      element={<AccountListHiddenScreenContainer />}
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
      path={routes.setupSeedRecovery.path}
      element={<SeedRecoverySetupScreen />}
    />
    <Route path={routes.setupRecovery.path} element={<RecoverySetupScreen />} />
    <Route
      presentation="push"
      path={routes.newToken.path}
      element={<AddTokenScreenContainer />}
    />
    <Route
      presentation="modal"
      path={routes.addPlugin.path}
      element={<AddPluginScreen />}
    />
    <Route
      path={routes.exportPrivateKey.path}
      element={<ExportPrivateKeyScreen />}
    />
    {/* Multisig */}
    <Route path={routes.multisigNew.path} element={<NewMultisigScreen />} />
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
      element={<MultisigPendingTransactionDetailsScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigPendingTransactionConfirmations.path}
      element={<MultisigTransactionConfirmationsScreen />}
    />
    <Route
      presentation="push"
      path={routes.multisigRemovedSettings.path}
      element={<RemovedMultisigSettingsScreenContainer />}
    />
    <Route
      presentation="push"
      path={routes.beforeYouContinue.path}
      element={<BeforeYouContinueScreen />}
    />
  </>
)

const fullscreenRoutes = (
  <>
    <Route
      path={routes.onboardingStart.path}
      element={<OnboardingStartScreenContainer />}
    />
    <Route
      path={routes.onboardingDisclaimer.path}
      element={<OnboardingDisclaimerScreenContainer />}
    />
    <Route
      path={routes.onboardingPrivacyStatement.path}
      element={<OnboardingPrivacyStatementScreenContainer />}
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
    <Route path={routes.userReview.path} element={<ReviewRatingScreen />} />
    <Route
      path={routes.userReviewFeedback.path}
      element={<ReviewFeedbackScreen />}
    />
    <Route
      path={routes.multisigCreate.path}
      element={<CreateMultisigStartScreen />}
    />
  </>
)

/** Make a list of non-wallet routes which will show in place of actions */
const nonWalletPaths = nonWalletRoutes.props.children.flatMap(
  (child: ReactNode) => {
    return isValidElement(child) ? child.props.path : []
  },
)

export const AppRoutes: FC = () => {
  useEntryRoute()
  useMessageStreamHandler()
  const location = useLocation()
  const { state, pathname } = location as LocationWithState
  const onAppRoutesAnimationComplete = useOnAppRoutesAnimationComplete()

  const { isLoading } = useAppState()
  const hasActions = useView(hasActionsView)
  const isRecovering = useView(isRecoveringView)

  /** TODO: refactor: this should maybe be invoked by service + worker pattern */
  const showActions = useMemo(() => {
    const isNonWalletRoute =
      nonWalletPaths.includes(pathname) || state?.showOnTop
    return hasActions && !isNonWalletRoute
  }, [hasActions, pathname, state])

  if (isRecovering) {
    return <LoadingScreenContainer loadingTexts={["Recovering accounts..."]} />
  }
  if (isLoading) {
    return <LoadingScreenContainer />
  }

  if (showActions) {
    return (
      <ResponsiveContainer>
        <ActionScreenContainer />
      </ResponsiveContainer>
    )
  }

  return (
    <RoutesConfig
      defaultPresentation="replace"
      onExitComplete={onAppRoutesAnimationComplete}
    >
      <Routes>
        <Route element={<ResponsiveRoutes />}>
          {nonWalletRoutes}
          {walletRoutes}
        </Route>
        {fullscreenRoutes}
      </Routes>
    </RoutesConfig>
  )
}
