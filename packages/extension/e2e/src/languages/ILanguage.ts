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
  }
  account: {
    noAccounts: string
    createAccount: string
    addFunds: string
    fundsFromStarkNet: string
    fullAccountAddress: string
    showAccountList: string
    send: string
    export: string
    accountRecovery: string
    saveTheRecoveryPhrase: string
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
    addresBook: string
    connectedDapps: string
    showRecoveryPhase: string
    developerSettings: string
    privacy: string
    hideAccount: string
    deleteAccount: string //only available for local network
    exportPrivateKey: string
    extendedView: string
    hide: string
    hiddenAccounts: string
    delete: string
    copy: string
  }
}
