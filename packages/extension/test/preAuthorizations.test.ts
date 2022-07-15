import {
  getPreAuthorizations,
  getPreAuthorizationsAllAccounts,
  isPreAuthorized,
  isPreAuthorizedAllAccounts,
  preAuthorize,
  preAuthorizeAllAccounts,
  removePreAuthorization,
  removePreAuthorizationAllAccounts,
  resetPreAuthorizations,
} from "../src/background/preAuthorizations"

describe("preAuthorizations", () => {
  describe("original implementation pre-authorized all acounts", () => {
    test("manages authorization state correctly", async () => {
      expect(await isPreAuthorizedAllAccounts("foo.xyz")).toBeFalsy()
      await preAuthorizeAllAccounts("foo.xyz")
      expect(await isPreAuthorizedAllAccounts("foo.xyz")).toBeTruthy()
      expect(await isPreAuthorizedAllAccounts("bar.xyz")).toBeFalsy()
      await preAuthorizeAllAccounts("bar.xyz")
      expect(await getPreAuthorizationsAllAccounts()).toEqual([
        "foo.xyz",
        "bar.xyz",
      ])
      await removePreAuthorizationAllAccounts("foo.xyz")
      expect(await isPreAuthorizedAllAccounts("foo.xyz")).toBeFalsy()
      expect(await isPreAuthorizedAllAccounts("bar.xyz")).toBeTruthy()
      await preAuthorizeAllAccounts("foo.xyz")
      expect(await getPreAuthorizationsAllAccounts()).toEqual([
        "bar.xyz",
        "foo.xyz",
      ])
      await resetPreAuthorizations()
      expect(await getPreAuthorizationsAllAccounts()).toEqual([])
      expect(await isPreAuthorizedAllAccounts("foo.xyz")).toBeFalsy()
      expect(await isPreAuthorizedAllAccounts("bar.xyz")).toBeFalsy()
    })
  })
  describe("pre-authorized accounts by host", () => {
    test("manages authorization state correctly", async () => {
      expect(
        await isPreAuthorized({ host: "foo.xyz", accountAddress: "0xabc" }),
      ).toBeFalsy()
      await preAuthorize({ host: "foo.xyz", accountAddress: "0xabc" })
      expect(
        await isPreAuthorized({ host: "foo.xyz", accountAddress: "0xabc" }),
      ).toBeTruthy()
      expect(
        await isPreAuthorized({ host: "foo.xyz", accountAddress: "0xdef" }),
      ).toBeFalsy()
      await preAuthorize({ host: "foo.xyz", accountAddress: "0xdef" })
      // multiple add should only add once
      await preAuthorize({ host: "bar.xyz", accountAddress: "0x123" })
      await preAuthorize({ host: "bar.xyz", accountAddress: "0x123" })
      expect(
        await isPreAuthorized({ host: "foo.xyz", accountAddress: "0xdef" }),
      ).toBeTruthy()
      expect(
        await isPreAuthorized({ host: "bar.xyz", accountAddress: "0x123" }),
      ).toBeTruthy()
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {
          "foo.xyz": ["0xabc", "0xdef"],
          "bar.xyz": ["0x123"],
        },
        allAccounts: [],
      })
      await removePreAuthorization({ host: "bar.xyz", accountAddress: "0x123" })
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {
          "foo.xyz": ["0xabc", "0xdef"],
        },
        allAccounts: [],
      })
    })
  })
  describe("when both implementations are used", () => {
    test("manages authorization state correctly", async () => {
      await preAuthorizeAllAccounts("foo.xyz")
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {},
        allAccounts: ["foo.xyz"],
      })
      await preAuthorize({ host: "bar.xyz", accountAddress: "0x123" })
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {
          "bar.xyz": ["0x123"],
        },
        allAccounts: ["foo.xyz"],
      })
      // override the 'all accounts' value
      await preAuthorize({ host: "foo.xyz", accountAddress: "0xabc" })
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {
          "foo.xyz": ["0xabc"],
          "bar.xyz": ["0x123"],
        },
        allAccounts: [],
      })
      // not possible to via UI, but handle anyway
      // don't allow same host entries in both 'allAccounts' AND 'accountsByHost'
      await preAuthorizeAllAccounts("bar.xyz")
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {
          "foo.xyz": ["0xabc"],
        },
        allAccounts: ["bar.xyz"],
      })
      await removePreAuthorizationAllAccounts("foo.xyz")
      expect(await getPreAuthorizations()).toEqual({
        accountsByHost: {},
        allAccounts: ["bar.xyz"],
      })
      // undefined account should still check all accounts
      expect(
        await isPreAuthorized({ host: "bar.xyz", accountAddress: undefined }),
      ).toBeTruthy()
      // should remove the 'allAccounts' authorization
      await removePreAuthorization({
        host: "bar.xyz",
        accountAddress: null,
      })
      expect(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await isPreAuthorized({ host: "bar.xyz", accountAddress: undefined }),
      ).toBeFalsy()
    })
  })
})
