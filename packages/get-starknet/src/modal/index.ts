import type {
  ConnectedStarknetWindowObject,
  StarknetWindowObject,
  WalletProvider,
} from "get-starknet-core"

import Modal from "./Modal.svelte"

export interface WalletProviderWithStoreVersion
  extends Omit<WalletProvider, "downloads"> {
  download: string
}

function excludeWallets<T extends { id: string }>(
  wallets: Array<T>,
  exclude: Array<{ id: string }>,
): T[] {
  return wallets.filter((w) => !exclude.some((e) => e.id === w.id))
}

export default async function show({
  discoveryWallets,
  installedWallets,
  lastWallet,
  preAuthorizedWallets,
  enable,
  modalOptions,
}: {
  lastWallet?: StarknetWindowObject
  installedWallets?: StarknetWindowObject[]
  preAuthorizedWallets?: StarknetWindowObject[]
  discoveryWallets?: WalletProviderWithStoreVersion[]
  enable?: (
    wallet: StarknetWindowObject | null,
  ) => Promise<ConnectedStarknetWindowObject | null>
  modalOptions?: {
    theme?: "light" | "dark" | "system"
  }
}): Promise<StarknetWindowObject | null> {
  return new Promise((resolve) => {
    // make sure wallets are not shown twice
    const fixedWallets = [lastWallet].filter(Boolean)
    preAuthorizedWallets = excludeWallets(preAuthorizedWallets, fixedWallets)
    installedWallets = excludeWallets(installedWallets, [
      ...fixedWallets,
      ...preAuthorizedWallets,
    ])
    discoveryWallets = excludeWallets(discoveryWallets, [
      ...fixedWallets,
      ...installedWallets,
      ...preAuthorizedWallets,
    ])

    const modal = new Modal({
      target: document.body,
      props: {
        enableArgentWebWallet: true,
        dappName: undefined,
        callback: async (value: StarknetWindowObject | null) => {
          const enabledValue = (await enable?.(value)) ?? value
          modal.$destroy()
          resolve(enabledValue)
        },
        lastWallet,
        installedWallets,
        preAuthorizedWallets,
        discoveryWallets,
        theme:
          modalOptions?.theme === "system" ? null : modalOptions?.theme ?? null,
      },
    })
  })
}
