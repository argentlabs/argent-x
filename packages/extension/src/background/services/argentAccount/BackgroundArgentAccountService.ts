import type {
  AddSmartAccountRequest,
  AddSmartAccountResponse,
  IHttpService,
} from "@argent/x-shared"
import { BaseError } from "@argent/x-shared"
import { stringToBytes } from "@scure/base"
import { keccak, pedersen } from "micro-starknet"
import { CallData, num, stark } from "starknet"
import urlJoin from "url-join"
import { withGuardianSelector } from "../../../shared/account/selectors"
import { accountService } from "../../../shared/account/service"
import type { WalletAccountSharedService } from "../../../shared/account/service/accountSharedService/WalletAccountSharedService"
import { ARGENT_ACCOUNT_PREFERENCES_URL } from "../../../shared/api/constants"
import type {
  Flow,
  PreferencesPayload,
} from "../../../shared/argentAccount/schema"
import { preferencesEndpointPayload } from "../../../shared/argentAccount/schema"
import {
  addBackendAccount,
  emailVerificationStatusErrorSchema,
  getSmartAccounts,
  isTokenExpired,
  register,
  requestEmailAuthentication,
  verifyEmail,
} from "../../../shared/smartAccount/backend/account"
import { generateJwt } from "../../../shared/smartAccount/jwt"
import {
  isSmartAccountEnabled,
  SMART_ACCOUNT_NETWORKS,
} from "../../../shared/smartAccount/useSmartAccountEnabled"
import { validateEmailForAccounts } from "../../../shared/smartAccount/validation/validateAccount"
import type { Wallet } from "../../wallet"
import type { IBackgroundArgentAccountService } from "./IBackgroundArgentAccountService"
import type { IBackgroundActionService } from "../action/IBackgroundActionService"
import { getProvider } from "../../../shared/network"

export default class BackgroundArgentAccountService
  implements IBackgroundArgentAccountService
{
  constructor(
    private wallet: Wallet,
    private httpService: IHttpService,
    private sharedAccountService: WalletAccountSharedService,
    private actionService: IBackgroundActionService,
  ) {}

  async addGuardianToAccount() {
    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new BaseError({ message: "No account selected" })
    }

    if (!isSmartAccountEnabled(selectedAccount.networkId)) {
      /** should never happen */
      throw new BaseError({
        message: "Smart account is not enabled for this network",
      })
    }

    /** Check if this account already exists in backend */
    const backendAccounts = await getSmartAccounts(selectedAccount.networkId)

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
          network: selectedAccount.networkId,
        }
        const response = await addBackendAccount(request)

        await this.sharedAccountService.sendAccountLabelToBackend({
          address: selectedAccount.address,
          name: selectedAccount.name,
          networkId: selectedAccount.networkId,
        })

        // Make /account call to update amplitude
        await this.isTokenExpired({
          initiator: "BackgroundArgentAccountService/addGuardianToAccount",
        })

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
    // when creating a smart account, we don't need to check the account, as it doesn't exist yet
    if (flow !== "createSmartAccount") {
      /** Check if account is valid for current wallet */

      const starknetAccount = await this.wallet.getSelectedStarknetAccount()
      const selectedAccount = await this.wallet.getSelectedAccount()

      if (!selectedAccount) {
        throw new BaseError({ message: "No account selected" })
      }

      if (!isSmartAccountEnabled(selectedAccount?.networkId)) {
        /** should never happen */
        throw new BaseError({
          message: "Smart account is not enabled for this network",
        })
      }

      if (!starknetAccount || !selectedAccount) {
        throw new BaseError({ message: "no accounts" })
      }
    }

    /** Get current account state */
    const localAccounts = await accountService.get()
    const localAccountsWithGuardian =
      await accountService.get(withGuardianSelector)

    const backendAccounts = []
    // we need to get all accounts from all networks that support smart accounts, as we the email address is the same for all networks
    for (const network of SMART_ACCOUNT_NETWORKS) {
      const accounts = await getSmartAccounts(network)
      backendAccounts.push(...accounts)
    }

    /** Validate email against account state */

    validateEmailForAccounts({
      localAccounts,
      localAccountsWithGuardian,
      backendAccounts,
    })
  }

  async isTokenExpired(extra: { initiator: string }) {
    return await isTokenExpired(extra)
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

  async updateSecurityPeriod(periodInSeconds: number): Promise<void> {
    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new BaseError({ message: "No account selected" })
    }
    const escapeSecurityPeriodPayload = {
      entrypoint: "set_escape_security_period",
      calldata: CallData.compile([periodInSeconds.toString()]),
      contractAddress: selectedAccount.address,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: escapeSecurityPeriodPayload,
          meta: {
            type: "UPDATE_SECURITY_PERIOD",
            ampliProperties: {
              "account type": "smart",
              "wallet platform": "browser extension",
            },
            isInAppSecurityChange: true,
          },
        },
      },
      {
        title: "Change security period",
      },
    )
  }

  async getSecurityPeriod(): Promise<number> {
    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new BaseError({ message: "No account selected" })
    }

    const provider = getProvider(selectedAccount.network)
    const result = await provider.callContract({
      contractAddress: selectedAccount.address,
      entrypoint: "get_escape_security_period",
    })
    return Number(result)
  }

  async removeGuardian(): Promise<void> {
    const selectedAccount = await this.wallet.getSelectedAccount()
    if (!selectedAccount) {
      throw new BaseError({ message: "No account selected" })
    }
    const removeGuardianPayload = {
      entrypoint: "trigger_escape_guardian",
      calldata: CallData.compile([0x1]),
      contractAddress: selectedAccount.address,
    }

    await this.actionService.add(
      {
        type: "TRANSACTION",
        payload: {
          transactions: removeGuardianPayload,
          meta: {
            type: "REMOVE_GUARDIAN",
            ampliProperties: {
              "is deployment": false,
              "account type": "smart",
              "wallet platform": "browser extension",
            },
            isInAppSecurityChange: true,
          },
        },
      },
      {
        title: "Remove guardian",
        icon: "NoShieldSecondaryIcon",
      },
    )
  }
}
