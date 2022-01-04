import ArgentCompiledContract from "!!raw-loader!../../contracts/ArgentAccount.txt"
import { ethers } from "ethers"
import { Provider, compileCalldata, ec, stark } from "starknet"
import browser from "webextension-polyfill"

import { BackupWallet } from "../../shared/backup.model"
import { selectedWalletStore } from "../selectedWallet"
import { Storage } from "../storage"

const isDev = process.env.NODE_ENV === "development"

interface StorageProps {
  encKeystore?: string
  wallets: BackupWallet[]
}

const store = new Storage<StorageProps>({ wallets: [] }, "L1")

export async function existsL1() {
  return Boolean(await store.getItem("encKeystore"))
}

export async function validatePassword(password: string) {
  try {
    await getL1(password)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

let rawWalletTimeoutPid: number | undefined
let rawWallet: ethers.Wallet | undefined

function setRawWallet(wallet: ethers.Wallet | undefined) {
  rawWallet = wallet
  rawWalletTimeoutPid = setTimeout(() => {
    rawWallet = undefined
  }, 15 * 60 * 60 * 1000) as unknown as number
}

export function isUnlocked(): boolean {
  return Boolean(rawWallet)
}

export async function setKeystore(keystore: string) {
  setRawWallet(undefined)
  await store.setItem("encKeystore", keystore)
}

async function recoverL1(
  password: string,
  progressFn: (progress: number) => void = () => {},
): Promise<ethers.Wallet> {
  if (!(await existsL1())) {
    throw Error("No KeyPair exists")
  }
  const encKeyPair = await store.getItem("encKeystore")
  return await ethers.Wallet.fromEncryptedJson(
    encKeyPair!,
    password,
    progressFn,
  )
}

async function generateL1(): Promise<ethers.Wallet> {
  if (await existsL1()) {
    throw Error("KeyPair already exists")
  }
  return ethers.Wallet.createRandom()
}

let sessionPassword: string | undefined
let recoverPromise: Promise<ethers.Wallet> | undefined
export async function getL1(password?: string): Promise<ethers.Wallet> {
  if (rawWallet) {
    return rawWallet
  } else if (await existsL1()) {
    if (!recoverPromise) {
      if (!password) {
        throw Error("Password required")
      }
      recoverPromise = recoverL1(password)
    }
    const recoveredWallet = await recoverPromise
    setRawWallet(recoveredWallet)
    sessionPassword = password
    const encKeyPair = JSON.parse((await store.getItem("encKeystore")) || "{}")

    store.setItem("wallets", encKeyPair.wallets ?? [])
    if (
      (await selectedWalletStore.getItem("SELECTED_WALLET")).address === "" &&
      encKeyPair.wallets.length > 0
    ) {
      await selectedWalletStore.setItem(
        "SELECTED_WALLET",
        encKeyPair.wallets[0],
      )
    }
    return recoveredWallet
  } else {
    sessionPassword = password
    const wallet = await generateL1()
    setRawWallet(wallet)
    return wallet
  }
}

export function lockWallet() {
  setRawWallet(undefined)
  recoverPromise = undefined
  sessionPassword = undefined
}

async function getEncKeyStore(
  wallet: ethers.Wallet,
  password: string,
  wallets: BackupWallet[],
  progressFn: (progress: number) => void = () => {},
): Promise<string> {
  const backup = await wallet.encrypt(
    password,
    {
      scrypt: {
        // The number must be a power of 2 (default: 131072 = 2 ^ 17)
        N: isDev ? 64 : 32768,
      },
    },
    progressFn,
  )

  const extendedBackup = JSON.stringify(
    {
      ...JSON.parse(backup),
      wallets,
    },
    null,
    2,
  )

  return extendedBackup
}

function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  browser.downloads.download({
    url,
    filename,
  })
}

export const getWallets = async (): Promise<BackupWallet[]> =>
  await store.getItem("wallets")

export async function createAccount(networkId: string) {
  if (!sessionPassword) {
    throw Error("Password required")
  }
  const l1 = await getL1()
  const starkPair = ec.getKeyPair(l1.privateKey)
  const starkPub = ec.getStarkKey(starkPair)
  const seed = ec.getStarkKey(ec.genKeyPair())
  const wallets = await getWallets()

  const provider = new Provider({ network: networkId as any })
  const deployTransaction = await provider.deployContract(
    ArgentCompiledContract,
    compileCalldata({
      signer: starkPub,
      guardian: "0",
    }),
    seed,
  )

  // TODO: register a L1 address with the wallet as soon as some registry is online

  if (deployTransaction.code !== "TRANSACTION_RECEIVED") {
    throw new Error("Deploy transaction failed")
  }

  const newWallet = { network: networkId, address: deployTransaction.address! }
  const newWallets = [...wallets, newWallet]
  const encKeyStore = await getEncKeyStore(l1, sessionPassword, newWallets)
  store.setItem("encKeystore", encKeyStore)
  store.setItem("wallets", newWallets)

  downloadTextFile(encKeyStore, "starknet-backup.json")
  return {
    address: deployTransaction.address!,
    txHash: deployTransaction.transaction_hash,
    wallets,
  }
}

export async function resetAll() {
  lockWallet()
  await browser.storage.local.clear()
}
