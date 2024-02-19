export interface ILanguage {
  common: {
    back: string
    close: string
    confirm: string
    done: string
    next: string
    continue: string
    yes: string
    no: string
    unlock: string
    showSettings: string
    reset: string
    confirmReset: string
    save: string
    create: string
    cancel: string
    privacyStatement: string
    approve: string
    addArgentShield: string
    removeArgentShield: string
    argentShieldAdded: string
    argentShieldRemoved: string
    dismiss: string
    reviewSend: string
    hide: string
    hiddenAccounts: string
    copy: string
    beforeYouContinue: string
    seedWarning: string
    revealSeedPhrase: string
    copied: string
    confirmRecovery: string
    remove: string
  }
  account: {
    noAccounts: string
    createAccount: string
    addFunds: string
    fundsFromStarkNet: string
    fullAccountAddress: string
    send: string
    export: string
    accountRecovery: string
    saveTheRecoveryPhrase: string
    pendingTransactions: string
    recipientAddress: string
    saveAddress: string
    confirmTheSeedPhrase: string
    showAccountRecovery: string
    deployFirst: string
    wrongPassword: string
    invalidStarkIdError: string
    shortAddressError: string
    invalidCheckSumError: string
    invalidAddress: string
    createMultisig: string
    activateAccount: string
    notEnoughFoundsFee: string
    newToken: string
    argentShield: {
      wrong2faCode: string
      failed2faCode: string
      codeNotRequested2fa: string
      emailInUse: string
    }
    removedFromMultisig: string
  }
  wallet: {
    //first screen
    banner1: string
    desc1: string
    createButton: string
    restoreButton: string
    //second screen
    banner2: string
    desc2: string
    lossOfFunds: string
    alphaVersion: string
    //third screen
    banner3: string
    desc3: string
    password: string
    repeatPassword: string
    createWallet: string
    //fourth screen
    banner4: string
    desc4: string
    twitter: string
    discord: string
    finish: string
  }
  settings: {
    account: {
      manageOwners: {
        manageOwners: string
        removeOwner: string
        replaceOwner: string
      }
      setConfirmations: string
      viewOnStarkScan: string
      viewOnVoyager: string
      hideAccount: string
      deployAccount: string
      connectedDapps: {
        connectedDapps: string
        connect: string
        reject: string
        disconnectAll: string
        noConnectedDapps: string
      }
      exportPrivateKey: string
    }
    preferences: {
      preferences: string
      hideTokens: string
      defaultBlockExplorer: string
      defaultNFTMarket: string
      emailNotifications: string
    }
    securityPrivacy: {
      securityPrivacy: string
      autoLockTimer: string
      recoveryPhase: string
      automaticErrorReporting: string
      shareAnonymousData: string
    }
    addressBook: {
      addressBook: string
      nameRequired: string
      addressRequired: string
      removeAddress: string
      delete: string
    }
    developerSettings: {
      developerSettings: string
      manageNetworks: {
        manageNetworks: string
        restoreDefaultNetworks: string
      }
      smartContractDevelopment: string
      experimental: string
    }
    extendedView: string
    lockWallet: string
  }
}
