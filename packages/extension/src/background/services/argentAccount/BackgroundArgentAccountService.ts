import type {
  IHttpService,
  AddSmartAccountRequest,
  AddSmartAccountResponse,
} from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"
import { stringToBytes } from "@scure/base"
import { keccak, pedersen } from "micro-starknet"
import { num, stark } from "starknet"
import urlJoin from "url-join"
import {
  getNetworkSelector,
  withGuardianSelector,
} from "../../../shared/account/selectors"
import { accountService } from "../../../shared/account/service"
import { ARGENT_ACCOUNT_PREFERENCES_URL } from "../../../shared/api/constants"
import type { IBackgroundArgentAccountService } from "./IBackgroundArgentAccountService"
import type {
  Flow,
  PreferencesPayload,
} from "../../../shared/argentAccount/schema"
import { preferencesEndpointPayload } from "../../../shared/argentAccount/schema"
import {
  addBackendAccount,
  emailVerificationStatusErrorSchema,
  getBackendAccounts,
  isTokenExpired,
  register,
  requestEmailAuthentication,
  verifyEmail,
} from "../../../shared/smartAccount/backend/account"
import { SMART_ACCOUNT_NETWORK_ID } from "../../../shared/smartAccount/constants"
import { generateJwt } from "../../../shared/smartAccount/jwt"
import { validateEmailForAccounts } from "../../../shared/smartAccount/validation/validateAccount"
import type { Wallet } from "../../wallet"
import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"

export default class BackgroundArgentAccountService
  implements IBackgroundArgentAccountService
{
  constructor(
    private wallet: Wallet,
    private httpService: IHttpService,
    private sharedAccountService: WalletAccountSharedService,
  ) {}

  async addGuardianToAccount() {
    if (!SMART_ACCOUNT_NETWORK_ID) {
      /** should never happen */
      throw new BaseError({
        message: "SMART_ACCOUNT_NETWORK_ID is not defined",
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
      guardianAddress = existingAccount.guardianAddresses?.[0]
    } else {
      /** Add account to backend */
      // BE throws error if the account is not deployed
      if (!selectedAccount.needsDeploy) {
        const signer = await this.wallet.getSignerForAccount(selectedAccount)
        const publicKey = await signer.getPubKey()
        const deploySignature = await signer.signRawMsgHash(
          pedersen(keccak(stringToBytes("utf8", "starknet")), publicKey),
        )

        const [r, s] = stark.signatureToHexArray(deploySignature)

        const request = {
          ownerAddress: publicKey,
          signature: {
            r,
            s,
          },
          accountAddress: selectedAccount.address,
        }
        const response = await addBackendAccount(request)

        await this.sharedAccountService.sendAccountNameToBackend({
          address: selectedAccount.address,
          name: selectedAccount.name,
        })

        // Make /account call to update amplitude
        await this.isTokenExpired()

        guardianAddress = response.guardianAddress
      }
    }
    if (!guardianAddress) {
      throw new BaseError({
        message: "Unable to add account",
      })
    }
    return guardianAddress
  }

  async addSmartAccount(
    request: AddSmartAccountRequest,
  ): Promise<AddSmartAccountResponse> {
    return addBackendAccount(request)
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

  async validateAccount(flow: Flow) {
    if (!SMART_ACCOUNT_NETWORK_ID) {
      /** should never happen */
      throw new BaseError({
        message: "SMART_ACCOUNT_NETWORK_ID is not defined",
      })
    }

    // when creating a smart account, we don't need to check the account, as it doesn't exist yet
    if (flow !== "createSmartAccount") {
      /** Check if account is valid for current wallet */
      const selectedAccount = await this.wallet.getSelectedAccount()
      const starknetAccount = await this.wallet.getSelectedStarknetAccount()

      if (!starknetAccount || !selectedAccount) {
        throw new BaseError({ message: "no accounts" })
      }
    }
    /** Get current account state */

    const localAccounts = await accountService.get(
      getNetworkSelector(SMART_ACCOUNT_NETWORK_ID),
    )
    const localAccountsWithGuardian =
      await accountService.get(withGuardianSelector)
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
    if (!ARGENT_ACCOUNT_PREFERENCES_URL) {
      throw new Error("ARGENT_ACCOUNT_URL is not defined")
    }
    // TODO move this one layer above in next ticket
    const jwt = await generateJwt()
    return await this.httpService.post<PreferencesPayload>(
      urlJoin(ARGENT_ACCOUNT_PREFERENCES_URL, "/preferences"),
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
    if (!ARGENT_ACCOUNT_PREFERENCES_URL) {
      throw new Error("ARGENT_ACCOUNT_URL is not defined")
    }
    const jwt = await generateJwt()
    return await this.httpService.get<PreferencesPayload>(
      urlJoin(ARGENT_ACCOUNT_PREFERENCES_URL, "/preferences"),
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
    )
  }
}
