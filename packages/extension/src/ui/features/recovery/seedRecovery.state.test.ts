import {
  useSeedRecovery,
  validateAndSetPassword,
  validateAndSetSeedPhrase,
  validateNewPassword,
  validateSeedPhrase,
  validateSeedRecoveryCompletion,
} from "./seedRecovery.state"

describe("Seed Recovery", () => {
  beforeEach(() => {
    useSeedRecovery.setState({})
  })
  describe("validateSeedPhrase", () => {
    describe("validateSeedRecoveryCompletion", () => {
      afterEach(() => {
        useSeedRecovery.setState({ password: undefined, seedPhrase: undefined })
      })
      it("should return true when given a state with a valid seed phrase and password", () => {
        const seedPhrase =
          "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
        const password = "password"
        useSeedRecovery.setState({ seedPhrase, password })
        expect(validateSeedRecoveryCompletion(useSeedRecovery.getState())).toBe(
          true,
        )
      })

      it("should return false when given a state without a seed phrase", () => {
        const password = "password"
        useSeedRecovery.setState({ password })

        expect(validateSeedRecoveryCompletion(useSeedRecovery.getState())).toBe(
          false,
        )
      })

      it("should return false when given a state without a password", () => {
        const seedPhrase =
          "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
        useSeedRecovery.setState({ seedPhrase })
        console.log(useSeedRecovery.getState())
        expect(validateSeedRecoveryCompletion(useSeedRecovery.getState())).toBe(
          false,
        )
      })

      it("should return false when given a state with an invalid seed phrase", () => {
        const seedPhrase =
          "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon"
        useSeedRecovery.setState({ seedPhrase })
        expect(validateSeedRecoveryCompletion(useSeedRecovery.getState())).toBe(
          false,
        )
      })
    })
    it("should return true for a valid seed phrase", () => {
      const seedPhrase =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
      expect(validateSeedPhrase(seedPhrase)).toBe(true)
    })

    it("should return false for an invalid seed phrase", () => {
      const seedPhrase =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon"
      expect(validateSeedPhrase(seedPhrase)).toBe(false)
    })
  })

  describe("validateNewPassword", () => {
    it("should return true for a valid password", () => {
      const password = "password"
      expect(validateNewPassword(password)).toBe(true)
    })

    it("should return false for a password that is too short", () => {
      const password = "1234"
      expect(validateNewPassword(password)).toBe(false)
    })
  })

  describe("validateAndSetSeedPhrase", () => {
    it("should set the seed phrase when given a valid seed phrase", () => {
      const seedPhrase =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
      validateAndSetSeedPhrase(seedPhrase)
      expect(useSeedRecovery.getState().seedPhrase).toBe(seedPhrase)
    })

    it("should throw an error when given an invalid seed phrase", () => {
      const seedPhrase =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon"
      expect(() => validateAndSetSeedPhrase(seedPhrase)).toThrowError(
        "Invalid seed phrase",
      )
    })
  })

  describe("validateAndSetPassword", () => {
    it("should set the password when given a valid password", () => {
      const password = "password"
      validateAndSetPassword(password)
      expect(useSeedRecovery.getState().password).toBe(password)
    })

    it("should throw an error when given an invalid password", () => {
      const password = "1234"
      expect(() => validateAndSetPassword(password)).toThrowError(
        "Invalid password",
      )
    })
  })
})
