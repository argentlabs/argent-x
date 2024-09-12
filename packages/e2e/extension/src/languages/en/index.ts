const texts = {
  common: {
    back: "Back",
    close: "Close",
    confirm: "Confirm",
    done: "Done",
    next: "Next",
    continue: "Continue",
    yes: "Yes",
    no: "No",
    unlock: "Unlock",
    showSettings: "Show settings",
    reset: "Reset",
    confirmReset: "Reset",
    save: "Save",
    create: "Create",
    cancel: "Cancel",
    privacyStatement:
      "GDPR statement for browser extension wallet: Argent takes the privacy and security of individuals very seriously and takes every reasonable measure and precaution to protect and secure the personal data that we process. The browser extension wallet does not collect any personal information nor does it correlate any of your personal information with anonymous data processed as part of its services. On top of this Argent has robust information security policies and procedures in place to make sure any processing complies with applicable laws. If you would like to know more or have any questions then please visit our website at https://www.argent.xyz/",
    approve: "Approve",
    addArgentShield: "Add Argent Shield",
    changeAccountType: "Change",
    accountUpgraded: "Account upgraded",
    changedToStandardAccount: "Changed to Standard Account",
    dismiss: "Dismiss",
    reviewSend: "Review send",
    hide: "Hide account",
    copy: "Copy",
    beforeYouContinue: "Before you continue...",
    seedWarning:
      "Please save your recovery phrase. This is the only way you will be able to recover your Argent X accounts",
    revealSeedPhrase: "Click to reveal recovery phrase",
    copied: "Copied",
    confirmRecovery:
      "I have saved my recovery phrase and understand I should never share it with anyone else",
    remove: "Remove",
    upgrade: "Upgrade",
  },
  account: {
    noAccounts: "You have no accounts on",
    createAccount: "Create account",
    fund: "Fund",
    fundsFromStarkNet: "From another Starknet wallet",
    fullAccountAddress: "Full account address",
    send: "Send",
    export: "Export",
    accountRecovery: "Save your recovery phrase",
    showAccountRecovery: "Show recovery phrase",
    saveTheRecoveryPhrase: "Save the recovery phrase",
    confirmTheSeedPhrase:
      "I have saved my recovery phrase and understand I should never share it with anyone else",
    pendingTransactions: "Pending",
    recipientAddress: "Recipient's address",
    saveAddress: "Save address",
    deployFirst:
      "You must deploy this account before upgrading to a Smart Account",
    wrongPassword: "Incorrect password",
    invalidStarkIdError: " not found",
    shortAddressError: "Address must be 66 characters long",
    invalidCheckSumError: "Invalid address (checksum error)",
    invalidAddress: "Invalid address",
    createMultisig: "Create multisig",
    activateAccount: "Activate Account",
    notEnoughFoundsFee: "Insufficient funds to pay fee",
    newToken: "New token",
    argentShield: {
      wrongCode: "Looks like the wrong code. Please try again.",
      failedCode:
        "You have reached the maximum number of attempts. Please wait 30 minutes and request a new code.",
      codeNotRequested:
        "You have not requested a verification code. Please request a new one.",
      emailInUse:
        "This address is associated with accounts from another seedphrase.Please enter another email address to continue.",
    },
    removedFromMultisig: "You were removed from this multisig",
    copyAddress: "Copy address",
  },
  wallet: {
    //first screen
    banner1: "Welcome to Argent X",
    desc1: "Enjoy the security of Ethereum with the scale of Starknet",
    createButton: "Create a new wallet",
    restoreButton: "Restore an existing wallet",
    //second screen
    banner2: "Disclaimer",
    desc2:
      "Starknet is in Alpha and may experience technical issues or introduce breaking changes from time to time. Please accept this before continuing.",
    lossOfFunds:
      "I understand that Starknet will introduce changes (e.g. Cairo 1.0) that will affect my existing account(s) (e.g. rendering unusable) if I do not complete account upgrades.",
    alphaVersion:
      "I understand that Starknet may experience performance issues and my transactions may fail for various reasons.",
    //third screen
    banner3: "New wallet",
    desc3: "Enter a password to protect your wallet",
    password: "Password",
    repeatPassword: "Repeat password",
    createWallet: "Create wallet",
    //fourth screen
    banner4: "Your wallet is ready!",
    desc4: "Follow us for product updates or if you have any questions",
    twitter: "Follow Argent on X",
    discord: "Join the Argent Discord",
    finish: "Finish",
  },
  settings: {
    account: {
      manageOwners: {
        manageOwners: "Manage owners",
        removeOwner: "Remove owner",
        replaceOwner: "Replace owner",
      },
      setConfirmations: "Set confirmations",
      viewOnStarkScan: "View on StarkScan",
      viewOnVoyager: "View on Voyager",
      hideAccount: "Hide account",
      deployAccount: "Deploy account",
      connectedDapps: {
        connectedDapps: "Connected dapps",
        connect: "Connect",
        reject: "Reject",
        disconnectAll: "Disconnect all",
        noConnectedDapps: "No connected dapps",
      },
      exportPrivateKey: "Export private key",
    },
    preferences: {
      preferences: "Preferences",
      hideTokens: "Hide tokens with no balance",
      hiddenAccounts: "Hidden accounts",
      defaultBlockExplorer: "Default block explorer",
      defaultNFTMarket: "Default NFT marketplace",
      emailNotifications: "Email notifications",
    },
    securityPrivacy: {
      securityPrivacy: "Security & privacy",
      autoLockTimer: "Auto lock timer",
      recoveryPhase: "Recovery phrase",
      automaticErrorReporting: "Automatic Error Reporting",
      shareAnonymousData: "Share anonymous data",
    },
    addressBook: {
      addressBook: "Address book",
      nameRequired: "Contact Name is required",
      addressRequired: "Address is required",
      removeAddress: "Remove from address book",
      delete: "Delete",
    },
    developerSettings: {
      developerSettings: "Developer settings",
      manageNetworks: {
        manageNetworks: "Manage networks",
        restoreDefaultNetworks: "Restore default networks",
      },
      smartContractDevelopment: "Smart Contract Development",
      experimental: "Experimental",
    },
    extendedView: "Extended view",
    lockWallet: "Lock wallet",
  },
}

export default texts
