/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers } from "ethers"
import { CompactEncrypt, importJWK } from "jose"
import { Args, InvokeFunctionTransaction, KeyPair, ec, encode } from "starknet"
import browser from "webextension-polyfill"
import { DoneEvent, assign, createMachine } from "xstate"

import {
  getLastSelectedWallet,
  getPublicKey,
  messenger,
  readLatestActionAndCount,
} from "../utils/messaging"
import { TokenDetails, addToken } from "../utils/tokens"
import { Wallet } from "../Wallet"
import { useProgress } from "./progress"

export type TransactionRequest = { to: string; method: string; calldata: Args }

type RouterEvents =
  | { type: "SHOW_CREATE_NEW" }
  | { type: "SHOW_RECOVER" }
  | { type: "GO_BACK" }
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
  | {
      type: "SUBMIT_PASSWORD"
      data: { password: string }
    }
  | {
      type: "ADD_TOKEN"
      data: { address: string; symbol: string; name: string; decimals: string }
    }
  | { type: "ADD_WALLET" }
  | { type: "APPROVE_TX"; data: TransactionRequest | InvokeFunctionTransaction }
  | { type: "APPROVED_TX" }
  | { type: "GENERATE_L1"; data: { password: string } }

interface Context {
  wallets: Record<string, Wallet>
  password?: string
  selectedWallet?: string
  selectedToken?: TokenDetails
  l1?: ethers.Wallet
  uploadedBackup?: string
  signer?: KeyPair
  txToApprove?: TransactionRequest | InvokeFunctionTransaction
  txHash?: string
  isPopup?: boolean
  hostToWhitelist?: string
  error?: string
}

interface SigningContext {
  l1: ethers.Wallet
  password: string
  signer: KeyPair
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

const isDev = process.env.NODE_ENV === "development"

const KEYSTORE_KEY = "keystore"

const getKeystoreFromLocalStorage = () => {
  const keyStore = localStorage.getItem(KEYSTORE_KEY)
  if (!keyStore) throw Error("no keystore found")
  const jsonKeyStore = JSON.parse(keyStore)
  if (!jsonKeyStore?.wallets?.length) throw Error("no argent keystore")

  return keyStore
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
  },
  states: {
    determineEntry: {
      invoke: {
        src: async (_ctx, ev) => {
          const keyStore = getKeystoreFromLocalStorage()
          const jsonKeyStore = JSON.parse(keyStore)
          return { wallets: jsonKeyStore.wallets }
        },
        onDone: { target: "enterPassword" },
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

          try {
            const pubJwk = await getPublicKey()
            const pubKey = await importJWK(pubJwk)

            console.log(pubKey)

            const encMsg = await new CompactEncrypt(
              encode.utf8ToArray(event.data.password),
            )
              .setProtectedHeader({ alg: "ECDH-ES", enc: "A256GCM" })
              .encrypt(pubKey)

            messenger.emit("START_SESSION", { enc: true, body: encMsg })
          } catch (e) {
            console.error(e)
          }

          const keyStore = ctx.uploadedBackup ?? getKeystoreFromLocalStorage()
          const jsonKeyStore = JSON.parse(keyStore)

          const l1 = await ethers.Wallet.fromEncryptedJson(
            keyStore,
            event.data.password,
            (progress) =>
              useProgress.setState({ progress, text: "Decrypting ..." }),
          )

          useProgress.setState({ progress: 0, text: "" })

          return {
            l1,
            wallets: jsonKeyStore.wallets,
            keyStore,
            password: event.data.password,
          }
        },
        onDone: {
          target: "recover",
          actions: [
            assign((_, ev) => ({
              password: ev.data.password,
              error: undefined,
            })),
            (_, ev) => {
              try {
                getKeystoreFromLocalStorage()
              } catch {
                localStorage.setItem(KEYSTORE_KEY, ev.data.keyStore)
              }
            },
          ],
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
    recover: {
      invoke: {
        src: async (_, event) => {
          const ev = event as DoneEvent
          const wallet: ethers.Wallet = ev.data.l1
          const wallets: string[] = ev.data.wallets

          const lastSelectedWallet = await getLastSelectedWallet().catch(
            () => "",
          )
          const selectedWalletIndex =
            (lastSelectedWallet ? wallets?.indexOf(lastSelectedWallet) : 0) || 0

          // if transactions are pending show them first
          const requestedActions = await readLatestActionAndCount().catch(
            () => null,
          )

          console.log(requestedActions)

          const keyPair = ec.getKeyPair(wallet.privateKey)
          return {
            l1: wallet,
            wallets: wallets
              .map((address) => new Wallet(address, keyPair))
              .reduce((acc, wallet) => {
                return {
                  ...acc,
                  [wallet.address]: wallet,
                }
              }, {}),
            signer: keyPair,
            selectedWallet: wallets[selectedWalletIndex],

            requestedActions,
          }
        },
        onDone: [
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
        onError: "determineEntry",
      },
    },
    welcome: {
      on: { SHOW_CREATE_NEW: "newSeed", SHOW_RECOVER: "uploadKeystore" },
    },
    newSeed: {
      on: { GO_BACK: "welcome", GENERATE_L1: "generateL1" },
    },
    generateL1: {
      invoke: {
        src: async (ctx, event) => {
          useProgress.setState({ progress: 0, text: "Generate Keypair..." })
          if (event.type === "GENERATE_L1")
            return {
              l1: ethers.Wallet.createRandom(),
              password: event.data.password,
            }
          throw Error("no password provided")
        },
        onDone: {
          target: "deployWallet",
          actions: assign((_ctx, { data }) => ({
            ...data,
          })),
        },
        onError: "welcome",
      },
    },
    deployWallet: {
      invoke: {
        src: async (ctx) => {
          useProgress.setState({
            progress: 0,
            text: "Deploying...",
          })
          const newWallet = await Wallet.fromDeploy(
            ctx.l1!.privateKey,
            ctx.l1!.address,
          )

          return {
            newWallet,
            password: ctx.password!,
          }
        },
        onDone: {
          target: "downloadBackup",
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
    downloadBackup: {
      invoke: {
        src: async (ctx) => {
          const password = ctx.password!
          if (password) {
            const backup = await ctx.l1!.encrypt(
              password,
              {
                scrypt: {
                  // The number must be a power of 2 (default: 131072 = 2 ^ 17)
                  N: isDev ? 64 : 32768,
                },
              },
              (progress) =>
                useProgress.setState({ progress, text: "Encrypting..." }),
            )
            useProgress.setState({ progress: 0, text: "" })

            const extendedBackup = JSON.stringify(
              {
                ...JSON.parse(backup),
                wallets: Object.keys(ctx.wallets),
              },
              null,
              2,
            )
            const blob = new Blob([extendedBackup], {
              type: "application/json",
            })
            const url = URL.createObjectURL(blob)
            browser.downloads.download({
              url,
              filename: "starknet-backup.json",
            })

            localStorage.setItem(KEYSTORE_KEY, extendedBackup)
          } else {
            throw new Error("no password provided")
          }
        },
        onDone: "account",
        onError: {
          target: "determineEntry",
          actions: (_, ev) => console.error(ev),
        },
      },
    },
    account: {
      entry: async (ctx) => {
        messenger.emit("WALLET_CONNECTED", ctx.selectedWallet!)
      },
      on: {
        SHOW_ACCOUNT_LIST: "accountList",
        SHOW_TOKEN: "token",
        SHOW_ADD_TOKEN: "addToken",
        APPROVE_TX: "approveTx",
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
          target: "enterPassword",
          actions: assign((_, ev) => ({
            uploadedBackup: ev.data,
          })),
        },
      },
    },
    reset: {
      on: {
        GO_BACK: "enterPassword",
        RESET: {
          target: "determineEntry",
          actions: () => {
            localStorage.clear()
            messenger.emit("RESET_ALL", undefined)
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
            messenger.emit("FAILED_TX", {
              tx: ctx.txToApprove as InvokeFunctionTransaction,
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
              messenger.emit("SUBMITTED_TX", {
                tx: ctx.txToApprove as InvokeFunctionTransaction,
                txHash: event.data,
              })
            },
          ],
        },
        onError: {
          target: "determineEntry",
          actions: (ctx) => {
            messenger.emit("FAILED_TX", {
              tx: ctx.txToApprove as InvokeFunctionTransaction,
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
            messenger.emit("APPROVE_WHITELIST", ctx.hostToWhitelist!)
          },
        },
        REJECT: {
          target: "accountList",
          actions: (ctx) => {
            messenger.emit("REJECT_WHITELIST", ctx.hostToWhitelist!)
          },
        },
      },
      exit: (ctx) => {
        if (ctx.isPopup) window.close()
      },
    },

    settings: {
      on: { GO_BACK: "accountList" },
    },
    submittedTx: {
      type: "final",
    },
  },
})
