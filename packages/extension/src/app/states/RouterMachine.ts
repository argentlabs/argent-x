/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers } from "ethers"
import { Args, InvokeFunctionTransaction, KeyPair, ec } from "starknet"
import browser from "webextension-polyfill"
import { DoneEvent, assign, createMachine } from "xstate"

import {
  getLastSelectedWallet,
  messenger,
  readRequestedTransactions,
} from "../utils/messaging"
import { addToken } from "../utils/tokens"
import { Wallet } from "../Wallet"
import { useProgress } from "./progress"

export type TxRequest = { to: string; method: string; calldata: Args }

type RouterEvents =
  | { type: "SHOW_CREATE_NEW" }
  | { type: "SHOW_RECOVER" }
  | { type: "GO_BACK" }
  | { type: "RESET" }
  | { type: "SHOW_ACCOUNT_LIST" }
  | { type: "SHOW_ADD_TOKEN" }
  | { type: "FORGOT_PASSWORD" }
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
  | { type: "APPROVE_TX"; data: TxRequest | InvokeFunctionTransaction }
  | { type: "APPROVED_TX" }
  | { type: "GENERATE_L1"; data: { password: string } }

type Context = {
  password?: string
  selectedWallet?: string
  l1?: ethers.Wallet
  uploadedBackup?: string
  signer?: KeyPair
  txToApprove?: TxRequest | InvokeFunctionTransaction
  txHash?: string
  wallets: Record<string, Wallet>
  isPopup?: boolean
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
        | "reset"
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
      context: Context & {
        l1: ethers.Wallet
        password: string
        signer: KeyPair
        selectedWallet: string
      }
    }
  | {
      value: "approveTx" | "submitTx"
      context: Context & {
        l1: ethers.Wallet
        password: string
        signer: KeyPair
        selectedWallet: string
        txToApprove: TxRequest
      }
    }
  | {
      value: "submittedTx"
      context: Context & {
        l1: ethers.Wallet
        password: string
        signer: KeyPair
        selectedWallet: string
        txToApprove: TxRequest
        txHash: string
      }
    }

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
        onError: "welcome",
      },
    },
    enterPassword: {
      on: { SUBMIT_PASSWORD: "verifyPassword", FORGOT_PASSWORD: "reset" },
    },
    verifyPassword: {
      invoke: {
        src: async (ctx, event) => {
          if (event.type !== "SUBMIT_PASSWORD") throw Error("wrong entry point")

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
          const requestedTransactions = await readRequestedTransactions().catch(
            () => [],
          )

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

            requestedTransactions,
          }
        },
        onDone: [
          {
            target: "approveTx",
            cond: (_ctx, ev) => {
              return Boolean(ev.data?.requestedTransactions?.length)
            },
            actions: [
              assign((_, event) => {
                const { requestedTransactions, ...ctx } = event.data
                return {
                  ...ctx,
                  uploadedBackup: undefined,
                  txToApprove: requestedTransactions?.[0],
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
            const backup = await ctx.l1!.encrypt(password, {}, (progress) =>
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
        onError: "determineEntry",
      },
    },
    account: {
      entry: async (ctx) => {
        messenger.emit("WALLET_CONNECTED", ctx.selectedWallet)
      },
      on: {
        SHOW_ACCOUNT_LIST: "accountList",
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
            messenger.emit("RESET_ALL", {})
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
      on: { APPROVED_TX: "submitTx" },
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
                tx: ctx.txToApprove,
                txHash: event.data,
              })
            },
          ],
        },
        onError: {
          target: "determineEntry",
          actions: (ctx) => {
            messenger.emit("FAILED_TX", {
              data: ctx.txToApprove,
            })
          },
        },
      },
      exit: (ctx) => {
        if (ctx.isPopup) window.close()
      },
    },
    submittedTx: {
      type: "final",
    },
  },
})
