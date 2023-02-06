import {
  Cosigner,
  CosignerMessage,
  CosignerOffchainMessage,
} from "@argent/guardian"
import retry from "async-retry"

import { ARGENT_API_BASE_URL } from "../../api/constants"
import { isFetcherError } from "../../api/fetcher"
import { IS_DEV } from "../../utils/dev"
import { coerceErrorToString } from "../../utils/error"
import { jwtFetcher } from "../jwtFetcher"

type EnsFreeStatus =
  | "taken"
  | "alreadyReserved"
  | "blacklisted"
  | "toBeReserved"
  | "notUTS46"
  | "userAlreadyRegistered"
export const isEnsFree = async (ens: string): Promise<EnsFreeStatus> => {
  try {
    const json = await jwtFetcher(
      `${ARGENT_API_BASE_URL}/account/isEnsFree?ens=${ens}`,
    )
    return json.status
  } catch (error) {
    throw new Error("failed to check ENS availability")
  }
}

type ReserveEnsStatus =
  | "taken"
  | "alreadyReserved"
  | "blacklisted"
  | "toBeReserved"
  | "notUTS46"
  | "userAlreadyRegistered"
export const reserveEns = async (ens: string): Promise<ReserveEnsStatus> => {
  try {
    const json = await jwtFetcher(`${ARGENT_API_BASE_URL}/account/reserveEns`, {
      method: "POST",
      body: JSON.stringify({
        ens,
      }),
    })
    return json.status
  } catch (error) {
    throw new Error("failed to reserve ENS")
  }
}

export const requestEmailAuthentication = async (
  email: string,
  locale = "en-EN",
) => {
  try {
    const json = await jwtFetcher(
      `${ARGENT_API_BASE_URL}/account/requestEmailAuthentication`,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          locale,
          application: "argentx",
        }),
      },
    )
    return json
  } catch (error) {
    throw new Error("failed to request email verification")
  }
}

export type EmailVerificationStatus =
  | "expired"
  | "maxAttemptsReached"
  | "unverified"
  | "verified"
  | "notRequested"
export const getEmailVerificationStatus =
  async (): Promise<EmailVerificationStatus> => {
    try {
      const json = await jwtFetcher(
        `${ARGENT_API_BASE_URL}/account/emailVerificationStatus`,
      )
      return json.status
    } catch (error) {
      throw new Error("Failed to get email verification status")
    }
  }

export const getVerificationErrorMessage = (
  status: EmailVerificationStatus,
) => {
  switch (status) {
    case "expired":
      return "Your verification code has expired. Please request a new one."
    case "maxAttemptsReached":
      return "You have reached the maximum number of attempts. Please wait 30 minutes and request a new code."
    case "unverified":
      return "Looks like the wrong code. Please try again."
    case "notRequested":
      return "You have not requested a verification code. Please request a new one."
    default:
      return "An error occurred. Please try again."
  }
}

export const register = async (): Promise<void> => {
  try {
    const json = await jwtFetcher(
      `${ARGENT_API_BASE_URL}/account/asyncRegister`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    )

    await retry(
      async (bail) => {
        const registerStatus = await getRegistrationStatus()
        if (registerStatus === "registering") {
          throw new Error("not registered yet")
        }
        if (registerStatus !== "registered") {
          bail(new Error("failed to register"))
        }
        // registered!
      },
      {
        forever: true,
        minTimeout: 1000,
        maxTimeout: 10000,
        factor: 1.5,
      },
    )

    return json
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
    throw new Error("Failed to register")
  }
}

interface VerifyEmailResponse {
  status: EmailVerificationStatus
  userRegistrationStatus: "registered" | "notRegistered"
}

export const verifyEmail = async (
  verificationCode: string,
): Promise<VerifyEmailResponse> => {
  const json: VerifyEmailResponse = await jwtFetcher(
    `${ARGENT_API_BASE_URL}/verifyEmail`,
    {
      method: "POST",
      body: JSON.stringify({
        verificationCode,
      }),
    },
  )
  return json
}

type RegistrationStatus = "notFound" | "registering" | "registered" | "failed"

export const getRegistrationStatus = async (): Promise<RegistrationStatus> => {
  try {
    const json = await jwtFetcher(
      `${ARGENT_API_BASE_URL}/account/registrationStatus`,
    )
    return json.status
  } catch (error) {
    throw new Error("Failed to get registration status")
  }
}

interface Account {
  name: string | null
  address: string
  ownerAddress: string
  chain: "ethereum" | "zksync" | "zksync2" | "starknet"
  deploymentStatus: "notDeployed" | "deploying" | "deployed" | "deployError"
  application: "mobile" | "webwallet" | "argentx"
  guardianAddresses: string[]
  implClassHash: string | null
  proxyClassHash: string | null
  salt: string | null
}

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const json = await jwtFetcher(
      `${ARGENT_API_BASE_URL}/accounts?application=argentx&chain=starknet`,
    )
    return json.accounts
  } catch (error) {
    throw new Error("Failed to get accounts")
  }
}

interface AddAccountResponse {
  address: string
  guardianAddress?: string
}

export const addAccount = async (
  pubKey: string,
  accountAddress: string,
  signature: string[],
): Promise<AddAccountResponse> => {
  try {
    const json = await jwtFetcher(`${ARGENT_API_BASE_URL}/account`, {
      method: "POST",
      body: JSON.stringify({
        chain: "starknet",
        application: "argentx",
        ownerAddress: pubKey,
        accountAddress,
        signature: {
          r: signature[0],
          s: signature[1],
        },
        assignCosigner: true,
      }),
    })
    return json
  } catch (error) {
    throw new Error("Failed to add account")
  }
}

export const cosignerSign: Cosigner = async (
  message: CosignerMessage | CosignerOffchainMessage,
  isOffchainMessage = false,
) => {
  const beEndpoint = isOffchainMessage
    ? "/cosigner/personalSign"
    : `/cosigner/sign`

  try {
    const json = await jwtFetcher(`${ARGENT_API_BASE_URL}${beEndpoint}`, {
      method: "POST",
      body: JSON.stringify(message),
    })
    return json
  } catch (error) {
    if (isFetcherError(error) && error.responseJson?.status) {
      throw new Error(
        `Argent Shield failed to co-sign - status:${error.responseJson?.status}`,
      )
    } else {
      throw new Error("Argent Shield failed to co-sign")
    }
  }
}
