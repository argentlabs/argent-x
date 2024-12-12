import { describe, it, expect, beforeEach } from "vitest"
import { PKManager } from "./PKManager"
import type { AccountId } from "../../wallet.model"
import type { IPKStore } from "../types"
import { MockFnObjectStore } from "../../storage/__new/__test__/mockFunctionImplementation"
import { getMockAccount } from "../../../../test/account.mock"

describe("PKManager", () => {
  let pkManager: PKManager
  let mockStore: MockFnObjectStore<IPKStore>

  beforeEach(() => {
    mockStore = new MockFnObjectStore<IPKStore>()

    mockStore.get.mockResolvedValueOnce({ keystore: {} })

    pkManager = new PKManager(mockStore, 1024) // Using a low N value for faster tests
  })

  it("should store an encrypted key", async () => {
    const accountId = "0x123" as AccountId
    const privateKey = "0xabcdef1234567890"
    const password = "testpassword"

    mockStore.set.mockResolvedValue(undefined)

    await pkManager.storeEncryptedKey(privateKey, password, accountId)

    expect(mockStore.set).toHaveBeenCalledWith(
      expect.objectContaining({
        keystore: expect.objectContaining({
          [accountId]: expect.objectContaining({
            nonce: expect.any(String),
            salt: expect.any(String),
            encryptedKey: expect.any(String),
          }),
        }),
      }),
    )
  })

  it("should retrieve and decrypt a stored key", async () => {
    const accountId = getMockAccount().id
    const privateKey = "0xabcdef1234567890"
    const password = "testpassword"

    // First, store the key
    await pkManager.storeEncryptedKey(privateKey, password, accountId)

    // Mock the get method to return the stored data
    mockStore.get.mockResolvedValue({
      keystore: {
        [accountId]: await pkManager["encryptKey"](privateKey, password),
      },
    })

    const retrievedKey = await pkManager.retrieveDecryptedKey(
      password,
      accountId,
    )
    expect(retrievedKey).toBe(privateKey)
  })

  it("should throw an error when retrieving a non-existent key", async () => {
    const accountId = "0x456" as AccountId
    const password = "testpassword"

    mockStore.get.mockResolvedValue({ keystore: {} })

    await expect(
      pkManager.retrieveDecryptedKey(password, accountId),
    ).rejects.toThrow("Key not found")
  })

  it("should throw an error when decrypting with an incorrect password", async () => {
    const accountId = "0x789" as AccountId
    const privateKey = "0x9876543210fedcba"
    const correctPassword = "correctpassword"
    const incorrectPassword = "wrongpassword"

    // Store the key with the correct password
    await pkManager.storeEncryptedKey(privateKey, correctPassword, accountId)

    // Mock the get method to return the stored data
    mockStore.get.mockResolvedValue({
      keystore: {
        [accountId]: await pkManager["encryptKey"](privateKey, correctPassword),
      },
    })

    // Attempt to retrieve with incorrect password
    await expect(
      pkManager.retrieveDecryptedKey(incorrectPassword, accountId),
    ).rejects.toThrow()
  })

  it("should use different salt and nonce for each encryption", async () => {
    const accountId1 = "0x111" as AccountId
    const accountId2 = "0x222" as AccountId
    const key = "0x1234abcd"
    const password = "samepassword"

    let storedData: IPKStore = { keystore: {} }

    mockStore.set.mockImplementation(async (value: IPKStore) => {
      storedData = {
        keystore: {
          ...storedData.keystore,
          ...value.keystore,
        },
      }
    })

    await pkManager.storeEncryptedKey(key, password, accountId1)
    mockStore.get.mockResolvedValue(storedData)

    await pkManager.storeEncryptedKey(key, password, accountId2)

    const encryptedData1 = storedData.keystore[accountId1]
    const encryptedData2 = storedData.keystore[accountId2]

    expect(encryptedData1).toBeDefined()
    expect(encryptedData2).toBeDefined()
    expect(encryptedData1.salt).not.toBe(encryptedData2.salt)
    expect(encryptedData1.nonce).not.toBe(encryptedData2.nonce)
    expect(encryptedData1.encryptedKey).not.toBe(encryptedData2.encryptedKey)
  })
})
