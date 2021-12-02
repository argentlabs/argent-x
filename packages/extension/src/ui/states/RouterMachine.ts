/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Args, InvokeFunctionTransaction } from "starknet"
import { DoneInvokeEvent, assign, createMachine } from "xstate"

import { sendMessage } from "../../shared/messages"
import { defaultNetworkId } from "../../shared/networks"
import {
  getLastSelectedWallet,
  getWallets,
  hasActiveSession,
  isInitialized,
  monitorProgress,
  readLatestActionAndCount,
  startSession,
  uploadKeystore,
} from "../utils/messaging"
import { TokenDetails, addToken } from "../utils/tokens"
import { Wallet } from "../Wallet"
import { useProgress } from "./progress"

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
  selectedWallet?: string
  selectedToken?: TokenDetails
  uploadedBackup?: string
  txToApprove?: TransactionRequest | InvokeFunctionTransaction
  txHash?: string
  isPopup?: boolean
  hostToWhitelist?: string
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
  | {
      value: "approveTx" | "submitTx"
      context: Context & SigningContext & { txToApprove: TransactionRequest }
    }
  | {
      value: "submittedTx"
      context: Context &
        SigningContext & { txToApprove: TransactionRequest; txHash: string }
    }
  | {
      value: "connect"
      context: Context & { hostToWhitelist: string }
    }

export const routerMachine = createMachine<
  Context,
  RouterEvents,
  RouterTypestate
>({
  id: "router",
  initial: "determineEntry",
  context: {
    wallets: {},
    networkId: defaultNetworkId,
  },
  states: {
    determineEntry: {
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
            localStorage.setItem("UNDERSTOOD_DISCLAIMER", JSON.stringify(true))
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
          if (event.type !== "SUBMIT_PASSWORD") throw Error("wrong entry point")

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

          const wallets = (await getWallets()).filter(
            ({ network }) => network === networkId,
          )

          const selectedWallet = wallets.find(
            ({ address }) => address === lastSelectedWallet?.address,
          )?.address

          // if actions are pending show them first
          const requestedActions = await readLatestActionAndCount().catch(
            () => null,
          )

          return {
            wallets: wallets
              .map(({ address }) => new Wallet(address, networkId))
              .reduce((acc, wallet) => {
                return {
                  ...acc,
                  [wallet.address]: wallet,
                }
              }, {}),
            selectedWallet,
            networkId,

            requestedActions,
            showAccountList: ev.type === "CHANGE_NETWORK",
          }
        },
        onDone: [
          {
            target: "accountList",
            cond: (_, event) =>
              !event.data.selectedWallet || event.data.showAccountList,
            actions: assign((_, event) => {
              const { requestedActions, ...ctx } = event.data
              return ctx
            }),
          },
          {
            target: "approveTx",
            cond: (_ctx, ev) => {
              return ev.data?.requestedActions?.action?.type === "TRANSACTION"
            },
            actions: [
              assign((_, event) => {
                const { requestedActions, ...ctx } = event.data
                return {
                  ...ctx,
                  uploadedBackup: undefined,
                  txToApprove: requestedActions?.action?.payload,
                  isPopup: true,
                }
              }),
            ],
          },
          {
            target: "connect",
            cond: (_ctx, ev) => {
              return ev.data?.requestedActions?.action?.type === "CONNECT"
            },
            actions: [
              assign((_, event) => {
                const { requestedActions, ...ctx } = event.data
                return {
                  ...ctx,
                  uploadedBackup: undefined,
                  hostToWhitelist: requestedActions?.action?.payload?.host,
                  isPopup: true,
                }
              }),
            ],
          },
          {
            target: "account",
            actions: assign((_, event) => {
              const { requestedTransactions, ...ctx } = event.data
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

          const newWallet = await Wallet.fromDeploy(ctx.networkId)

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
      },
    },
    account: {
      entry: async (ctx) => {
        sendMessage({
          type: "WALLET_CONNECTED",
          data: { address: ctx.selectedWallet!, network: ctx.networkId },
        })
      },
      on: {
        SHOW_ACCOUNT_LIST: "accountList",
        SHOW_TOKEN: "token",
        SHOW_ADD_TOKEN: "addToken",
        APPROVE_TX: "approveTx",
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
        APPROVE_TX: "approveTx",
      },
    },
    addToken: {
      on: {
        GO_BACK: "account",
        ADD_TOKEN: {
          target: "account",
          actions: (ctx, ev) => {
            if (ev.data.address) {
              addToken(ctx.selectedWallet!, ev.data)
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
          await uploadKeystore(ev.data)
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

    approveTx: {
      entry: assign((_, event) => {
        if (event.type === "APPROVE_TX") {
          return {
            txToApprove: event.data,
          }
        }
        return {}
      }),
      on: {
        APPROVED_TX: "submitTx",
        REJECT_TX: {
          target: "account",
          actions: (ctx) => {
            sendMessage({
              type: "FAILED_TX",
              data: { tx: ctx.txToApprove as InvokeFunctionTransaction },
            })

            if (ctx.isPopup) window.close()
          },
        },
      },
    },
    submitTx: {
      invoke: {
        src: async (ctx, event) => {
          const wallet = ctx.wallets[ctx.selectedWallet!]!

          if (
            "type" in ctx.txToApprove! &&
            ctx.txToApprove.type === "INVOKE_FUNCTION"
          ) {
            // raw request
            const {
              contract_address,
              entry_point_selector,
              calldata = [],
            } = ctx.txToApprove

            const { transaction_hash } = await wallet.invoke(
              contract_address,
              entry_point_selector,
              calldata,
            )

            return transaction_hash
          } else if ("to" in ctx.txToApprove!) {
            // request which needs compilation
            const { to, method, calldata } = ctx.txToApprove!

            const { transaction_hash } = await wallet.invoke(
              to,
              method,
              calldata,
            )

            return transaction_hash
          }
        },
        onDone: {
          target: "submittedTx",
          actions: [
            assign((_, event) => ({
              txHash: event.data,
            })),
            (ctx, event) => {
              sendMessage({
                type: "SUBMITTED_TX",
                data: {
                  txHash: event.data,
                  tx: ctx.txToApprove as InvokeFunctionTransaction,
                },
              })
            },
          ],
        },
        onError: {
          target: "determineEntry",
          actions: (ctx) => {
            sendMessage({
              type: "FAILED_TX",
              data: { tx: ctx.txToApprove as InvokeFunctionTransaction },
            })
          },
        },
      },
      exit: (ctx) => {
        if (ctx.isPopup) window.close()
      },
    },
    connect: {
      on: {
        AGREE: {
          target: "accountList",
          actions: (ctx) => {
            sendMessage({
              type: "APPROVE_WHITELIST",
              data: ctx.hostToWhitelist!,
            })
          },
        },
        REJECT: {
          target: "accountList",
          actions: (ctx) => {
            sendMessage({
              type: "REJECT_WHITELIST",
              data: ctx.hostToWhitelist!,
            })
          },
        },
      },
      exit: (ctx) => {
        if (ctx.isPopup) window.close()
      },
    },

    settings: {
      on: { GO_BACK: "accountList", LOCK: "enterPassword" },
    },
    submittedTx: {
      type: "final",
    },
  },
})
