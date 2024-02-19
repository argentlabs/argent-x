import { Account } from "@argent-x/extension/src/ui/features/accounts/Account"

export const accountAddress =
  "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a"

export const account = {
  name: "Account 1",
  address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
  network: {
    id: "mainnet-alpha",
    name: "Mainnet",
    chainId: "SN_MAIN",
    rpcUrl: "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.5",
    explorerUrl: "https://voyager.online",
    l1ExplorerUrl: "https://etherscan.io",
    accountClassHash: {
      standard:
        "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
      multisig:
        "0x0737ee2f87ce571a58c6c8da558ec18a07ceb64a6172d5ec46171fbc80077a48",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    possibleFeeTokenAddresses: [
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    ],
    readonly: true,
  },
  networkId: "mainnet-alpha",
  signer: {
    derivationPath: "m/44'/9004'/0'/0/0",
    type: "local_secret",
  },
  needsDeploy: false,
  type: "standard",
  classHash:
    "0x01a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003",
  cairoVersion: "1",
  guardian: "0x380b9ff6fb8cf4b58a162948f4a9246113257558dc1cca38446a581f6bac898",
} as unknown as Account
