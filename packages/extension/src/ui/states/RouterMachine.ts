/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber } from "ethers"
import {
  Args,
  InvokeFunctionTransaction,
  compileCalldata,
  stark,
} from "starknet"
import { DoneInvokeEvent, assign, createMachine } from "xstate"

import { ExtActionItem } from "../../shared/actionQueue"
import { sendMessage } from "../../shared/messages"
import {
  defaultNetwork,
  localNetworkUrl,
  networkWallets,
} from "../../shared/networks"
import {
  getActions,
  getLastSelectedWallet,
  getWallets,
  hasActiveSession,
  isInitialized,
  monitorProgress,
  recoverKeystore,
  startSession,
} from "../utils/messaging"
import { Wallet } from "../Wallet"
import { useProgress } from "./progress"
import { TokenDetails, addToken } from "./tokens"

export type TransactionRequest = { to: string; method: string; calldata: Args }

type RouterEvents =
  | { type: "SHOW_CREATE_NEW" }
  | { type: "SHOW_RECOVER" }
  | { type: "GO_BACK" }
  | { type: "LOCK" }
  | { type: "RESET" }
  | { type: "REJECT_TX" }
  | { type: "SHOW_ACCOUNT_LIST" }
  | { type: "SHOW_TOKEN"; data: TokenDetails }
  | { type: "SHOW_ADD_TOKEN" }
  | { type: "SHOW_SETTINGS" }
  | { type: "FORGOT_PASSWORD" }
  | { type: "AGREE" }
  | { type: "REJECT" }
  | { type: "SUBMIT_KEYSTORE"; data: string }
  | { type: "SELECT_WALLET"; data: string }
  | { type: "CHANGE_NETWORK"; data: string }
  | { type: "CHANGE_PORT"; data: number }
  | {
      type: "SUBMIT_PASSWORD"
      data: { password: string }
    }
  | {
      type: "ADD_TOKEN"
      data: {
        address: string
        symbol: string
        name: string
        decimals: string
        networkId: string
      }
    }
  | { type: "ADD_WALLET" }
  | {
      type: "APPROVE_TX"
      data: TransactionRequest | InvokeFunctionTransaction
    }
  | { type: "APPROVED_TX" }
  | { type: "GENERATE_L1"; data: { password: string } }

interface Context {
  wallets: Record<string, Wallet>
  networkId: string
  localhostPort: number
  selectedWallet?: string
  selectedToken?: TokenDetails
  uploadedBackup?: string
  actions: ExtActionItem[]
  isPopup?: boolean
  txHash?: string
  error?: string
}

interface SigningContext {
  selectedWallet: string
}

type RouterTypestate =
  | {
      value:
        | "determineEntry"
        | "welcome"
        | "newSeed"
        | "uploadKeystore"
        | "enterPassword"
        | "verifyPassword"
        | "recover"
        | "recoverNetwork"
        | "disclaimer"
        | "reset"
        | "settings"
        | "generateL1"
      context: Context
    }
  | {
      value:
        | "downloadBackup"
        | "account"
        | "accountList"
        | "deployWallet"
        | "addToken"
      context: Context & SigningContext
    }
  | {
      value: "token"
      context: Context & SigningContext & { selectedToken: string }
    }

export const createRouterMachine = (closeAfterActions?: boolean) =>
  createMachine<Context, RouterEvents, RouterTypestate>({
    id: "router",
    initial: "determineEntry",
    context: {
      wallets: {},
      networkId: defaultNetwork.id,
      localhostPort: (() => {
        const port = parseInt(localStorage.port)
        return !port || isNaN(port) ? 5000 : port
      })(),
      actions: [],
      isPopup: closeAfterActions,
    },
    states: {
      determineEntry: {
        entry: (_, event) => {
          if (event.type === "APPROVE_TX") {
            sendMessage({
              type: "ADD_TRANSACTION",
              data:
                "type" in event.data && event.data.type === "INVOKE_FUNCTION"
                  ? event.data
                  : {
                      type: "INVOKE_FUNCTION",
                      contract_address: (event.data as TransactionRequest).to,
                      entry_point_selector: stark.getSelectorFromName(
                        (event.data as TransactionRequest).method,
                      ),
                      calldata: compileCalldata(
                        (event.data as TransactionRequest).calldata || {},
                      ),
                    },
            })
          }
        },
        invoke: {
          src: async (_ctx, ev) => {
            const initialized = await isInitialized()
            if (!initialized) throw Error("Not initialized")

            const hasSession = await hasActiveSession()

            return hasSession
          },
          onDone: [
            {
              target: "recoverNetwork",
              cond: (ctx, ev) => {
                const event = ev as DoneInvokeEvent<boolean>
                return event.data
              },
            },
            { target: "enterPassword" },
          ],
          onError: [
            {
              target: "disclaimer",
              cond: () => {
                try {
                  const understoodDisclaimer = JSON.parse(
                    localStorage.getItem("UNDERSTOOD_DISCLAIMER") || "false",
                  )
                  return !understoodDisclaimer
                } catch {
                  return true
                }
              },
            },
            {
              target: "welcome",
            },
          ],
        },
      },
      disclaimer: {
        on: {
          AGREE: {
            target: "welcome",
            actions: () => {
              localStorage.setItem(
                "UNDERSTOOD_DISCLAIMER",
                JSON.stringify(true),
              )
            },
          },
        },
      },
      enterPassword: {
        on: { SUBMIT_PASSWORD: "verifyPassword", FORGOT_PASSWORD: "reset" },
      },
      verifyPassword: {
        invoke: {
          src: async (ctx, event) => {
            if (event.type !== "SUBMIT_PASSWORD")
              throw Error("wrong entry point")

            monitorProgress((progress) => {
              useProgress.setState({ progress, text: "Decrypting ..." })
            })

            await startSession(event.data.password)

            useProgress.setState({ progress: 0, text: "" })
          },
          onDone: {
            target: "recoverNetwork",
            actions: assign((_, _ev) => ({
              error: undefined,
            })),
          },

          onError: {
            actions: assign((ctx) => ({
              ...ctx,
              error: "Password was wrong",
            })),
            target: "enterPassword",
          },
        },
      },
      recoverNetwork: {
        invoke: {
          src: async () => {
            const { network } = await getLastSelectedWallet()

            if (!network) throw Error("No network stored")

            return {
              networkId: network,
            }
          },
          onDone: {
            target: "recover",
            actions: assign((_, ev) => ({
              networkId: ev.data.networkId,
            })),
          },
          onError: "recover",
        },
      },
      recover: {
        invoke: {
          src: async ({ networkId }, ev) => {
            const lastSelectedWallet = await getLastSelectedWallet().catch(
              () => null,
            )

            const wallets = networkWallets(await getWallets(), networkId)

            const selectedWallet = wallets.find(
              ({ address }) => address === lastSelectedWallet?.address,
            )?.address

            // if actions are pending show them first
            const actions = await getActions().catch(() => [])

            return {
              wallets: wallets
                .map(({ address, network }) => new Wallet(address, network))
                .reduce((acc, wallet) => {
                  return {
                    ...acc,
                    [wallet.address]: wallet,
                  }
                }, {}),
              selectedWallet,
              networkId,
              actions,

              showAccountList: ev.type === "CHANGE_NETWORK",
            }
          },
          onDone: [
            {
              target: "accountList",
              cond: (_, event) =>
                event.data.showAccountList || !event.data.selectedWallet,
              actions: assign((_, event) => {
                const { showAccountList, ...ctx } = event.data
                return {
                  ...ctx,
                  uploadedBackup: undefined,
                }
              }),
            },
            {
              target: "account",
              actions: assign((_, event) => {
                const { showAccountList, ...ctx } = event.data
                return {
                  ...ctx,
                  uploadedBackup: undefined,
                }
              }),
            },
          ],
          onError: [{ target: "determineEntry" }],
        },
      },
      welcome: {
        on: { SHOW_CREATE_NEW: "newSeed", SHOW_RECOVER: "uploadKeystore" },
      },
      newSeed: {
        on: { GO_BACK: "welcome", GENERATE_L1: "deployWallet" },
      },
      deployWallet: {
        invoke: {
          src: async (ctx, event) => {
            useProgress.setState({
              progress: 0,
              text: "Deploying...",
            })

            if (event.type === "GENERATE_L1")
              await startSession(event.data.password)

            const network = localNetworkUrl(ctx.networkId, ctx.localhostPort)
            const newWallet = await Wallet.fromDeploy(network)

            useProgress.setState({ progress: 0, text: "" })

            return {
              newWallet,
            }
          },
          onDone: {
            target: "account",
            actions: assign((ctx, { data }) => ({
              ...ctx,
              selectedWallet: data.newWallet.address,
              wallets: {
                ...ctx.wallets,
                [data.newWallet.address]: data.newWallet,
              },
            })),
          },
          onError: {
            target: "accountList",
          },
        },
      },
      account: {
        entry: [
          async (ctx) => {
            sendMessage({
              type: "WALLET_CONNECTED",
              data: {
                address: ctx.selectedWallet!,
                network: localNetworkUrl(ctx.networkId, ctx.localhostPort),
              },
            })
          },
          assign(({ wallets, selectedWallet }) => {
            try {
              if (!selectedWallet) {
                throw new Error()
              }
              const wallet = wallets[selectedWallet]
              const url = new URL(wallet.networkId)
              if (url.hostname !== "localhost") {
                throw new Error()
              }
              return { localhostPort: parseInt(url.port) }
            } catch {
              return {}
            }
          }),
        ],
        on: {
          SHOW_ACCOUNT_LIST: "accountList",
          SHOW_TOKEN: "token",
          SHOW_ADD_TOKEN: "addToken",
          APPROVE_TX: "determineEntry",
          CHANGE_NETWORK: {
            target: "recover",
            actions: [
              assign((ctx, { data }) => ({
                ...ctx,
                networkId: data,
              })),
            ],
          },
        },
      },
      accountList: {
        on: {
          SELECT_WALLET: {
            target: "account",
            actions: assign((_, event) => ({
              selectedWallet: event.data,
            })),
          },
          ADD_WALLET: "deployWallet",
          SHOW_SETTINGS: "settings",
          CHANGE_NETWORK: {
            target: "recover",
            actions: [
              assign((ctx, { data }) => ({
                ...ctx,
                networkId: data,
              })),
            ],
          },
        },
      },
      token: {
        entry: assign((_, event) => {
          if (event.type === "SHOW_TOKEN") {
            return {
              selectedToken: event.data,
            }
          }
          return {}
        }),
        on: {
          GO_BACK: "account",
          APPROVE_TX: "determineEntry",
        },
      },
      addToken: {
        on: {
          GO_BACK: "account",
          ADD_TOKEN: {
            target: "account",
            actions: (ctx, ev) => {
              if (ev.data.address) {
                addToken({
                  ...ev.data,
                  decimals: BigNumber.from(ev.data.decimals),
                })
              }
            },
          },
        },
      },
      uploadKeystore: {
        on: {
          GO_BACK: "welcome",
          SUBMIT_KEYSTORE: {
            target: "uploadingKeystore",
          },
        },
      },
      uploadingKeystore: {
        invoke: {
          src: async (ctx, ev) => {
            if (ev.type !== "SUBMIT_KEYSTORE") throw Error("wrong entry point")
            await recoverKeystore(ev.data)
          },
          onDone: "enterPassword",
          onError: "determineEntry",
        },
      },
      reset: {
        on: {
          GO_BACK: "enterPassword",
          RESET: {
            target: "determineEntry",
            actions: () => {
              sendMessage({ type: "RESET_ALL" })
              localStorage.clear()
            },
          },
        },
      },
      settings: {
        on: {
          GO_BACK: "accountList",
          LOCK: {
            target: "enterPassword",
            actions: () => {
              sendMessage({ type: "STOP_SESSION" })
            },
          },
          CHANGE_PORT: {
            target: "settings",
            actions: [
              assign((ctx, { data }) => {
                localStorage.setItem("port", `${data}`)
                return { ...ctx, localhostPort: data }
              }),
            ],
          },
        },
      },
    },
  })
