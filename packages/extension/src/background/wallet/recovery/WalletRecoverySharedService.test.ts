import { bytesToHex, hexToBytes } from "@noble/hashes/utils"
import { HDKey } from "@scure/bip32"
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39"
import { wordlist } from "@scure/bip39/wordlists/english"
import { grindKey } from "micro-starknet"
import { encode } from "starknet"
import type { Mock } from "vitest"

import { defaultNetworks } from "../../../shared/network"
import type {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { WalletSession } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { WalletRecoverySharedService } from "./WalletRecoverySharedService"
import type { WalletRecoveryStarknetService } from "./WalletRecoveryStarknetService"
import { WalletError } from "../../../shared/errors/wallet"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import {
  emitterMock,
  getSessionStoreMock,
  getStoreMock,
  getWalletStoreMock,
} from "../../../shared/test.utils"

describe("WalletRecoverySharedService", () => {
  let service: WalletRecoverySharedService
  let storeMock: IObjectStore<WalletStorageProps>
  let walletStoreMock: IRepository<WalletAccount>
  let sessionStoreMock: IObjectStore<WalletSession | null>
  let chainRecoveryServiceMock: WalletRecoveryStarknetService
  let networkServiceMock: { getById: Mock }
  beforeEach(() => {
    vi.clearAllMocks()
    networkServiceMock = {
      getById: vi.fn(),
    }
  })

  it("should throw an error when session secret is not defined", async () => {
    storeMock = getStoreMock()
    walletStoreMock = getWalletStoreMock()
    sessionStoreMock = getSessionStoreMock()

    service = new WalletRecoverySharedService(
      emitterMock,
      storeMock,
      walletStoreMock,
      sessionStoreMock,
      networkServiceMock,
      chainRecoveryServiceMock,
    )

    await expect(service.discoverAccounts()).rejects.toThrow(
      new WalletError({ code: "NOT_INITIALIZED" }),
    )
  })

  it("should discover accounts", async () => {
    const mnemonic = generateMnemonic(wordlist)
    const seed = mnemonicToSeedSync(mnemonic)
    const preGrindPrivateKey =
      HDKey.fromMasterSeed(seed).derive("m/44'/9004'/0'/0/0").privateKey

    if (!preGrindPrivateKey) {
      throw new Error("Could not generate private key")
    }

    const grindedKey = grindKey(preGrindPrivateKey)
    const paddedKey = grindedKey.padStart(64, "0")
    const privateKey = hexToBytes(encode.removeHexPrefix(paddedKey))
    const mockSession = {
      secret: encode.addHexPrefix(bytesToHex(privateKey)),
      password: "password",
    }

    storeMock = getStoreMock()
    walletStoreMock = getWalletStoreMock()
    sessionStoreMock = getSessionStoreMock({
      get: vi.fn(() => Promise.resolve(mockSession)),
    })
    const mockAccount = { name: "mockAccount" }
    networkServiceMock = {
      getById: vi.fn().mockResolvedValue({ networkId: "networkId" }),
    }
    chainRecoveryServiceMock = {
      restoreAccountsFromWallet: vi.fn(() =>
        Promise.resolve([mockAccount] as WalletAccount[]),
      ),
    } as unknown as WalletRecoveryStarknetService
    service = new WalletRecoverySharedService(
      emitterMock,
      storeMock,
      walletStoreMock,
      sessionStoreMock,
      networkServiceMock,
      chainRecoveryServiceMock,
    )
    const result = await service.discoverAccounts()
    const mockAccounts = new Array(defaultNetworks.length).fill(mockAccount)

    expect(result).toEqual(mockAccounts)
    expect(walletStoreMock.upsert).toHaveBeenCalledWith(mockAccounts)
    expect(storeMock.set).toHaveBeenCalledWith({ discoveredOnce: true })
  })
})
