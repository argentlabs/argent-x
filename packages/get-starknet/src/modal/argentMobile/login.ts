import SignClient from "@walletconnect/sign-client"
import type { SignClientTypes } from "@walletconnect/types"

import type { NamespaceAdapter, NamespaceAdapterOptions } from "./adapter"
import { argentModal } from "./argentModal"

export interface IArgentLoginOptions {
  projectId?: string
  name?: string
  description?: string
  chainId?: string | number
  rpcUrl?: string
  bridgeUrl?: string
  modalType?: "overlay" | "window"
  walletConnect?: SignClientTypes.Options
}

export const login = async <TAdapter extends NamespaceAdapter>(
  {
    projectId,
    chainId,
    name,
    rpcUrl,
    bridgeUrl = getBridgeUrl(chainId),
    modalType = "overlay",
    walletConnect,
  }: IArgentLoginOptions,
  Adapter: new (options: NamespaceAdapterOptions) => TAdapter,
): Promise<TAdapter> => {
  argentModal.bridgeUrl = bridgeUrl
  argentModal.type = modalType

  const signClientOptions = {
    projectId,
    metadata: {
      name: name ?? "Unknown dapp",
      description: "Unknown dapp description",
      url: "#",
      icons: ["https://walletconnect.com/walletconnect-logo.png"],
      ...walletConnect?.metadata,
    },
    ...walletConnect,
  }

  const client = await SignClient.init(signClientOptions)
  const adapter = new Adapter({ client, chainId, rpcUrl })

  client.on("session_event", (_) => {
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
  })

  client.on("session_update", ({ topic, params }) => {
    const { namespaces } = params
    const session = client.session.get(topic)
    // Overwrite the `namespaces` of the existing session with the incoming one.
    // Integrate the updated session state into your dapp state.
    adapter.updateSession({ ...session, namespaces })
  })

  client.on("session_delete", () => {
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
  })

  try {
    const session = client.session.getAll().find(adapter.isValidSession)
    if (session) {
      adapter.updateSession(session)
      return adapter
    }

    const params = { requiredNamespaces: adapter.getRequiredNamespaces() }
    const { uri, approval } = await client.connect(params)

    // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
    if (uri) {
      argentModal.showConnectionModal(uri)
      argentModal.wcUri = uri

      // Await session approval from the wallet.
      const session = await approval()
      adapter.updateSession(session)
      argentModal.closeModal("animateSuccess")
    }

    return adapter
  } catch (error) {
    console.error("@argent/login::error")
    argentModal.closeModal()
    throw error
  }
}

const getBridgeUrl = (chainId: unknown) => {
  if (chainId) {
    const chainIdNumber = parseInt(`${chainId}`)
    if (
      String(chainId).startsWith("SN_GOERLI") ||
      String(chainId).startsWith("SN_GOERLI2") ||
      [5, 280].includes(chainIdNumber)
    ) {
      return "https://login.hydrogen.argent47.net"
    }

    if (
      String(chainId).startsWith("SN_GOERLI") ||
      [1, 324].includes(chainIdNumber)
    ) {
      return "https://login.argent.xyz"
    }
  }
  throw new Error(
    `Unknown or unsupported chainId (${chainId}), either specify a supported chain or set bridgeUrl.`,
  )
}
