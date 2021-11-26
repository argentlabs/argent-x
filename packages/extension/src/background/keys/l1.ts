import ArgentCompiledContract from "!!raw-loader!../../contracts/ArgentAccount.txt"
import { ethers } from "ethers"
import { compileCalldata, defaultProvider, ec, encode, stark } from "starknet"
import { hash } from "starknet"
import browser from "webextension-polyfill"

import { Storage } from "../storage"

const isDev = process.env.NODE_ENV === "development"

const store = new Storage<{
  encKeystore?: string
  passwordHash?: string
  walletAddresses: string[]
}>(
  {
    walletAddresses: [],
  },
  "L1",
)

function hashString(str: string) {
  return hash.hashCalldata([encode.buf2hex(encode.utf8ToArray(str))])
}

export async function validatePassword(password: string) {
  const passwordHashFromStorage = await store.getItem("passwordHash")
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

export async function existsL1() {
  return Boolean(await store.getItem("encKeystore"))
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
    console.log(hashString(password), await store.getItem("passwordHash"))
    store.setItem("passwordHash", hashString(password))
    const encKeyPair = JSON.parse((await store.getItem("encKeystore")) || "{}")
    console.log("encKeyPair", encKeyPair)
    store.setItem("walletAddresses", encKeyPair.wallets ?? [])
    return recoveredWallet
  } else {
    return generateL1()
  }
}

async function getEncKeyStore(
  wallet: ethers.Wallet,
  password: string,
  wallets: string[],
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

export const getWallets = () => store.getItem("walletAddresses")

export async function createAccount(
  password: string,
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

  const encKeyStore = await getEncKeyStore(l1, password, [
    ...wallets,
    deployTransaction.address!,
  ])
  store.setItem("encKeystore", encKeyStore)
  store.setItem("walletAddresses", [...wallets, deployTransaction.address!])
  store.setItem("passwordHash", hashString(password))

  downloadTextFile(encKeyStore, "starknet-backup.json")
  return {
    address: deployTransaction.address!,
    txHash: deployTransaction.transaction_hash,
    wallets,
  }
}
