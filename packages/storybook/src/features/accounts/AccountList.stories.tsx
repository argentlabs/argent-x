import { AccountList } from "@argent-x/extension/src/ui/features/accounts/AccountList"

import { decorators } from "../../decorators/routerDecorators"

/** TODO: refactor - this does not work until AccountListScreenItem is made context-free */

const baseAccount = {
  needsDeploy: false,
  networkId: "sepolia-alpha",
  signer: {
    derivationPath: "m/44'/9004'/0'/0/1",
    type: "local_secret",
  },
  type: "standard",
  network: {
    id: "sepolia-alpha",
    name: "Testnet",
    chainId: "SN_SEPOLIA",
    baseUrl: "https://alpha4.starknet.io",
    explorerUrl: "https://sepolia.voyager.online",
    accountClassHash: {
      standard:
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      plugin:
        "0x4ee23ad83fb55c1e3fac26e2cd951c60abf3ddc851caa9a7fbb9f5eddb2091",
      betterMulticall:
        "0x057c2f22f0209a819e6c60f78ad7d3690f82ade9c0c68caea492151698934ede",
      argent5MinuteEscapeTestingAccount:
        "0x058a42e2553e65e301b7f22fb89e4a2576e9867c1e20bb1d32746c74ff823639",
      multisig:
        "0x04ba0f956a26b5e0d7e491661a0c56a6eb0fc25d49912677de09439673c3c828",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    status: "unknown",
    readonly: true,
  },
}

export default {
  component: AccountList,
  decorators,
}

export const Default = {
  args: {
    title: "Foo bar Accounts",
    deprecatedAccounts: [
      {
        name: "Depreacted 1",
        address: "0x123",
        ...baseAccount,
      },
    ],
    hiddenAccounts: [
      {
        name: "Hidden 1",
        address: "0x123",
        ...baseAccount,
      },
    ],
    hiddenPendingMultisigs: [],
    multisigAccounts: [],
    newAccounts: [
      {
        name: "New 1",
        address: "0x123",
        ...baseAccount,
      },
    ],
    pendingMultisigs: [],
    standardAccounts: [
      {
        name: "Standard 1",
        address: "0x123",
        ...baseAccount,
      },
    ],
    visibleAccounts: [
      {
        name: "Visible 1",
        address: "0x123",
        ...baseAccount,
      },
    ],
    visiblePendingMultisigs: [],
  },
}
