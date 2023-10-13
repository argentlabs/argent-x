import { IArgentAccountServiceBackground } from "../../../../shared/argentAccount/service/interface"
import { ARGENT_SHIELD_NETWORK_ID } from "../../../../shared/shield/constants"
import {
  addBackendAccount,
  emailVerificationStatusErrorSchema,
  getBackendAccounts,
  isTokenExpired,
  register,
  requestEmailAuthentication,
  verifyEmail,
} from "../../../../shared/shield/backend/account"
import { encode, num } from "starknet"
import { keccak, pedersen, sign, Signature } from "micro-starknet"
import { stringToBytes } from "@scure/base"
import { Wallet } from "../../../wallet"
import { accountService } from "../../../../shared/account/service"
import {
  getNetworkSelector,
  withGuardianSelector,
} from "../../../../shared/account/selectors"
import { validateEmailForAccounts } from "../../../../shared/shield/validation/validateAccount"
import {
  PreferencesPayload,
  preferencesEndpointPayload,
} from "../../procedures/argentAccount/updatePreferences.model"
import { IHttpService } from "@argent/shared"
import urlJoin from "url-join"
import { ARGENT_ACCOUNT_URL } from "../../../../shared/api/constants"
import { generateJwt } from "../../../../shared/shield/jwt"
import { BaseError } from "../../../../shared/errors/baseError"

export default class BackgroundArgentAccountService
  implements IArgentAccountServiceBackground
{
  constructor(private wallet: Wallet, private httpService: IHttpService) {}

  async addAccount() {
    if (!ARGENT_SHIELD_NETWORK_ID) {
      /** should never happen */
      throw new BaseError({
        message: "ARGENT_SHIELD_NETWORK_ID is not defined",
      })
    }
    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new BaseError({ message: "No account selected" })
    }

    /** Check if this account already exists in backend */
    const backendAccounts = await getBackendAccounts()

    const existingAccount = backendAccounts.find(
      (x) =>
        num.hexToDecimalString(x.address) ===
        num.hexToDecimalString(selectedAccount.address),
    )

    let guardianAddress: string | undefined

    if (existingAccount) {
      guardianAddress = existingAccount.guardianAddresses[0]
    } else {
      /** Add account to backend */
      const keyPair = await this.wallet.getKeyPairByDerivationPath(
        selectedAccount?.signer.derivationPath,
      )
      const privateKey = keyPair.getPrivate()
      const publicKey = keyPair.pubKey
      const privateKeyHex = num.toHex(privateKey)

      const deploySignature = sign(
        pedersen(keccak(stringToBytes("utf8", "starknet")), publicKey),
        privateKeyHex,
      )

      const { r, s } = Signature.fromDER(deploySignature.toDERHex())
      const response = await addBackendAccount(
        publicKey,
        selectedAccount.address,
        [
          encode.addHexPrefix(r.toString(16)),
          encode.addHexPrefix(s.toString(16)),
        ],
      )
      guardianAddress = response.guardianAddress
    }
    if (!guardianAddress) {
      throw new BaseError({
        message: "Unable to add account",
      })
    }
    return guardianAddress
  }

  async requestEmail(email: string) {
    try {
      await requestEmailAuthentication(email)
    } catch (error) {
      throw new BaseError({
        message: "Error while requesting email for argent account",
        options: {
          error,
          context: { email },
        },
      })
    }
  }

  async confirmEmail(code: string) {
    try {
      const { userRegistrationStatus } = await verifyEmail(code)

      if (userRegistrationStatus === "notRegistered") {
        await register()
      }
    } catch (error) {
      let message = "Error while confirming email for argent account"
      const emailVerificationStatusError =
        emailVerificationStatusErrorSchema.safeParse(error)
      if (emailVerificationStatusError.success) {
        message = emailVerificationStatusError.data.responseJson.status
      }
      throw new BaseError({
        message,
        options: {
          error,
          context: { code },
        },
      })
    }
  }

  async validateAccount() {
    if (!ARGENT_SHIELD_NETWORK_ID) {
      /** should never happen */
      throw new BaseError({
        message: "ARGENT_SHIELD_NETWORK_ID is not defined",
      })
    }

    /** Check if account is valid for current wallet */
    const selectedAccount = await this.wallet.getSelectedAccount()
    const starknetAccount = await this.wallet.getSelectedStarknetAccount()

    if (!starknetAccount || !selectedAccount) {
      throw new BaseError({ message: "no accounts" })
    }

    /** Get current account state */

    const localAccounts = await accountService.get(
      getNetworkSelector(ARGENT_SHIELD_NETWORK_ID),
    )
    const localAccountsWithGuardian = await accountService.get(
      withGuardianSelector,
    )
    const backendAccounts = await getBackendAccounts()

    /** Validate email against account state */

    validateEmailForAccounts({
      localAccounts,
      localAccountsWithGuardian,
      backendAccounts,
    })
  }

  async isTokenExpired() {
    return await isTokenExpired()
  }

  async updatePreferences(preferences: PreferencesPayload) {
    if (!ARGENT_ACCOUNT_URL) {
      throw new Error("ARGENT_ACCOUNT_URL is not defined")
    }
    // TODO move this one layer above in next ticket
    const jwt = await generateJwt()
    return await this.httpService.post<PreferencesPayload>(
      urlJoin(ARGENT_ACCOUNT_URL, "/preferences"),
      {
        body: JSON.stringify(preferences),
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
      preferencesEndpointPayload,
    )
  }

  async getPreferences() {
    if (!ARGENT_ACCOUNT_URL) {
      throw new Error("ARGENT_ACCOUNT_URL is not defined")
    }
    const jwt = await generateJwt()
    return await this.httpService.get<PreferencesPayload>(
      urlJoin(ARGENT_ACCOUNT_URL, "/preferences"),
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
    )
  }
}
