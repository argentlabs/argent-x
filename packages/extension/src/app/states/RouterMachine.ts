/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ethers } from "ethers"
import { getKeyPair, KeyPair, Args } from "starknet"
import { assign, createMachine, DoneEvent } from "xstate"
import browser from "webextension-polyfill"
import { addToken } from "../utils/tokens"
import { Wallet } from "../Wallet"

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
  | { type: "APPROVE_TX"; data: TxRequest }
  | { type: "APPROVED_TX" }
  | { type: "GENERATE_L1"; data: { password: string } }

type Context = {
  password?: string
  selectedWallet?: string
  l1?: ethers.Wallet
  uploadedBackup?: string
  signer?: KeyPair
  txToApprove?: TxRequest
  txHash?: string
  wallets: Record<string, Wallet>
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
        src: async () => {
          await new Promise((res) => setTimeout(res, 2000))
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
          )

          return {
            l1,
            wallets: jsonKeyStore.wallets,
            keyStore,
            password: event.data.password,
          }
        },
        onDone: [
          {
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
        ],
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
          const keyPair = getKeyPair(wallet.privateKey)
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
            selectedWallet: wallets[0],
          }
        },
        onDone: {
          target: "account",
          actions: assign((_, event) => ({
            ...event.data,
            uploadedBackup: undefined,
          })),
        },
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
            const backup = await ctx.l1!.encrypt(password)

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

          const { to, method, calldata } = ctx.txToApprove!

          const { transaction_hash } = await wallet.invoke(to, method, calldata)

          return transaction_hash
        },
        onDone: {
          target: "submittedTx",
          actions: assign((_, event) => ({
            txHash: event.data,
          })),
        },
        onError: "determineEntry",
      },
    },
    submittedTx: {
      type: "final",
    },
  },
})
