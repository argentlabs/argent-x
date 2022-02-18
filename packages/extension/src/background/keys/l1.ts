import ArgentCompiledContract from "!!raw-loader!../../contracts/ArgentAccount.txt"
import { ethers } from "ethers"
import { compileCalldata, ec } from "starknet"
import browser from "webextension-polyfill"

import { BackupWallet } from "../../shared/backup.model"
import { getProvider } from "../../shared/networks"
import { selectedWalletStore } from "../selectedWallet"
import { Storage } from "../storage"
import {
  getNextPathIndex,
  getPathForIndex,
  getStarkPair,
} from "./keyDerivation"

const isDev = process.env.NODE_ENV === "development"

const STORAGE_KEY = "KEYSTORE"
interface StorageProps {
  [STORAGE_KEY]?: string
}

const store = new Storage<StorageProps>({}, "L1")

export async function existsL1() {
  return Boolean(await store.getItem(STORAGE_KEY))
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

let rawWallet: ethers.Wallet | undefined

function setRawWallet(wallet?: ethers.Wallet) {
  rawWallet = wallet
  setTimeout(() => {
    rawWallet = undefined
  }, 15 * 60 * 60 * 1000)
}

export function isUnlocked(): boolean {
  return Boolean(rawWallet)
}

async function getKeystore() {
  const encKeystore = await store.getItem(STORAGE_KEY)
  if (!encKeystore) {
    throw Error("No keystore exists")
  }
  const encKeystoreObj = JSON.parse(encKeystore)
  return JSON.stringify({
    ...encKeystoreObj,
    wallets: encKeystoreObj["x-argent"].accounts,
  })
}

async function setKeystore(keystore: string) {
  setRawWallet(undefined)
  await store.setItem(STORAGE_KEY, keystore)
}

async function validateKeystore(keystore: string) {
  const keystoreObj = JSON.parse(keystore)
  if (keystoreObj["x-version"] !== 1) {
    throw Error("Invalid Keystore file format")
  }
}

export async function importKeystore(keystore: string) {
  validateKeystore(keystore)
  setKeystore(keystore)
}

async function recoverL1(password: string): Promise<ethers.Wallet> {
  if (!(await existsL1())) {
    throw Error("No KeyPair exists")
  }
  const encKeystore = await getKeystore()
  return await ethers.Wallet.fromEncryptedJson(encKeystore, password)
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
    try {
      const recoveredWallet = await recoverPromise
      setRawWallet(recoveredWallet)
      sessionPassword = password
      const encKeystore = JSON.parse((await store.getItem(STORAGE_KEY)) || "{}")

      if (
        (await selectedWalletStore.getItem("SELECTED_WALLET")).address === "" &&
        encKeystore.wallets.length > 0
      ) {
        await selectedWalletStore.setItem(
          "SELECTED_WALLET",
          encKeystore.wallets[0],
        )
      }
      return recoveredWallet
    } catch (e) {
      recoverPromise = undefined
      throw e
    }
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

async function getEncKeystore(
  wallet: ethers.Wallet,
  password: string,
  wallets: BackupWallet[],
  progressFn?: (progress: number) => void,
): Promise<string> {
  // The number of encryption rounds must be a power of 2 (default: 131072 = 2 ^ 17)
  const N = isDev ? 64 : 32768
  const backup = await wallet.encrypt(password, { scrypt: { N } }, progressFn)

  const extendedBackup = {
    ...JSON.parse(backup),
    "x-version": 1,
    "x-argent": { accounts: wallets },
  }
  return JSON.stringify(extendedBackup, null, 2)
}

function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  browser.downloads.download({ url, filename })
}

export const getWallets = async (): Promise<BackupWallet[]> => {
  try {
    const { wallets } = JSON.parse(await getKeystore())
    return wallets
  } catch {
    return []
  }
}

export async function createAccount(networkId: string) {
  if (!sessionPassword) {
    throw Error("Password required")
  }
  const l1 = await getL1()
  const wallets = await getWallets()

  const current_paths = wallets
    .filter((wallet) => wallet.signer.type === "local_secret")
    .map((wallet) => wallet.signer.derivation_path)

  const index = getNextPathIndex(current_paths)
  const starkPair = getStarkPair(index, l1.privateKey)
  const starkPub = ec.getStarkKey(starkPair)
  const seed = starkPub //ec.getStarkKey(ec.genKeyPair())

  const provider = getProvider(networkId)
  const deployTransaction = await provider.deployContract(
    ArgentCompiledContract,
    compileCalldata({ signer: starkPub, guardian: "0" }),
    seed,
  )

  // TODO: register a L1 address with the wallet as soon as some registry is online

  if (
    deployTransaction.code !== "TRANSACTION_RECEIVED" ||
    !deployTransaction.address
  ) {
    throw new Error("Deploy transaction failed")
  }

  const newWallet = {
    network: networkId,
    address: deployTransaction.address,
    signer: {
      type: "local_secret",
      derivation_path: getPathForIndex(index),
    },
  }
  const newWallets = [...wallets, newWallet]
  const encKeystore = await getEncKeystore(l1, sessionPassword, newWallets)
  store.setItem(STORAGE_KEY, encKeystore)

  downloadTextFile(encKeystore, "starknet-backup.json")
  return {
    wallet: newWallet,
    txHash: deployTransaction.transaction_hash,
    wallets,
  }
}

export async function downloadBackupFile() {
  const encKeystore = (await store.getItem(STORAGE_KEY)) ?? ""
  downloadTextFile(encKeystore, "starknet-backup.json")
}

export async function resetAll() {
  lockWallet()
  await browser.storage.local.clear()
}

export const deleteAccount = async (account: string) => {
  const keystore = JSON.parse(await getKeystore())
  const wallets = keystore.wallets.filter(
    ({ address }: any) => address !== account,
  )
  const newKeystore = JSON.stringify(
    { ...keystore, "x-argent": { accounts: wallets } },
    null,
    2,
  )
  await setKeystore(newKeystore)
  await getL1()
}
