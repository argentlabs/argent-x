import ArgentCompiledContract from "!!raw-loader!../../contracts/ArgentAccount.txt"
import { ethers } from "ethers"
import { compileCalldata, defaultProvider, ec, encode, stark } from "starknet"
import { hash } from "starknet"
import browser from "webextension-polyfill"

import { BackupWallet } from "../../shared/backup.model"
import { Storage } from "../storage"

const isDev = process.env.NODE_ENV === "development"

interface StorageProps {
  encKeystore?: string
  passwordHash?: string
  walletAddresses: BackupWallet[]
}

const store = new Storage<StorageProps>({ walletAddresses: [] }, "L1")

function hashString(str: string) {
  return hash.hashCalldata([encode.buf2hex(encode.utf8ToArray(str))])
}

export async function existsL1() {
  return Boolean(await store.getItem("encKeystore"))
}

export async function validatePassword(password: string) {
  const passwordHashFromStorage = await store.getItem("passwordHash")

  if (!passwordHashFromStorage && (await existsL1())) {
    try {
      await getL1(password)
      return true
    } catch {
      return false
    }
  }

  return passwordHashFromStorage
    ? hashString(password) === passwordHashFromStorage
    : true
}

let rawWalletTimeoutPid: number | undefined
let rawWallet: ethers.Wallet | undefined

function setRawWallet(wallet: ethers.Wallet) {
  rawWallet = wallet
  rawWalletTimeoutPid = setTimeout(() => {
    rawWallet = undefined
  }, 15 * 60 * 60 * 1000) as unknown as number
}

export async function setKeystore(keystore: string) {
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

let recoverPromise: Promise<ethers.Wallet> | undefined
export async function getL1(password: string): Promise<ethers.Wallet> {
  if (rawWallet) {
    return rawWallet
  } else if (await existsL1()) {
    if (!recoverPromise) recoverPromise = recoverL1(password)
    const recoveredWallet = await recoverPromise
    setRawWallet(recoveredWallet)
    store.setItem("passwordHash", hashString(password))
    const encKeyPair = JSON.parse((await store.getItem("encKeystore")) || "{}")
    store.setItem("walletAddresses", encKeyPair.wallets ?? [])
    return recoveredWallet
  } else {
    return generateL1()
  }
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

export const getWallets = async (networkId?: string): Promise<BackupWallet[]> =>
  (await store.getItem("walletAddresses"))
    .map((wallet) => {
      if (typeof wallet === "string") {
        // backwards compatibility
        return { network: "goerli-alpha", address: wallet } as const
      }
      return wallet
    })
    .filter((wallet) => {
      if (networkId && networkId !== wallet.network) {
        return false
      }
      return true
    })

export async function createAccount(
  password: string,
  networkId: string,
  progressFn: (progress: number) => void = () => {},
) {
  const l1 = await getL1(password)
  const starkPair = ec.getKeyPair(l1.privateKey)
  const starkPub = ec.getStarkKey(starkPair)
  const seed = ec.getStarkKey(ec.genKeyPair())
  const wallets = await getWallets()

  const deployTransaction = await defaultProvider.deployContract(
    ArgentCompiledContract,
    compileCalldata({
      signer: starkPub,
      guardian: "0",
      L1_address: stark.makeAddress(await l1.getAddress()),
    }),
    seed,
  )

  if (deployTransaction.code !== "TRANSACTION_RECEIVED") {
    throw new Error("Deploy transaction failed")
  }

  const newWallet = { network: networkId, address: deployTransaction.address! }
  const newWallets = [...wallets, newWallet]
  const encKeyStore = await getEncKeyStore(l1, password, newWallets)
  store.setItem("encKeystore", encKeyStore)
  store.setItem("walletAddresses", newWallets)
  store.setItem("passwordHash", hashString(password))

  downloadTextFile(encKeyStore, "starknet-backup.json")
  return {
    address: deployTransaction.address!,
    txHash: deployTransaction.transaction_hash,
    wallets,
  }
}
