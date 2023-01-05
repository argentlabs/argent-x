import retry from "async-retry"

import { ARGENT_API_BASE_URL } from "../../api/constants"
import { fetcher, isFetcherError } from "../../api/fetcher"
import { IS_DEV } from "../../utils/dev"
import { coerceErrorToString } from "../../utils/error"
import { generateJwt } from "../jwt"

/** TODO: align approach - originally copied from packages/web */

type EnsFreeStatus =
  | "taken"
  | "alreadyReserved"
  | "blacklisted"
  | "toBeReserved"
  | "notUTS46"
  | "userAlreadyRegistered"
export const isEnsFree = async (ens: string): Promise<EnsFreeStatus> => {
  const jwt = await generateJwt()
  const response = await fetch(
    `${ARGENT_API_BASE_URL}/account/isEnsFree?ens=${ens}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    throw new Error("failed to check ENS availability")
  }

  const json = await response.json()
  return json.status
}

type ReserveEnsStatus =
  | "taken"
  | "alreadyReserved"
  | "blacklisted"
  | "toBeReserved"
  | "notUTS46"
  | "userAlreadyRegistered"
export const reserveEns = async (ens: string): Promise<ReserveEnsStatus> => {
  const jwt = await generateJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/account/reserveEns`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ens,
    }),
  })

  if (!response.ok) {
    throw new Error("failed to reserve ENS")
  }

  const json = await response.json()
  return json.status
}

export const requestEmailAuthentication = async (
  email: string,
  locale = "en-EN",
): Promise<void> => {
  const jwt = await generateJwt()
  const json = await fetcher(
    `${ARGENT_API_BASE_URL}/account/requestEmailAuthentication`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        locale,
        application: "argentx",
      }),
    },
  )
  // if (!res.ok) {
  //   throw new Error("failed to request email verification")
  // }
  console.log("requestEmailAuthentication", JSON.stringify(json, null, 2))
  return json
}

export type EmailVerificationStatus =
  | "expired"
  | "maxAttemptsReached"
  | "unverified"
  | "verified"
  | "notRequested"
export const getEmailVerificationStatus =
  async (): Promise<EmailVerificationStatus> => {
    const jwt = await generateJwt()
    try {
      const json = await fetcher(
        `${ARGENT_API_BASE_URL}/account/emailVerificationStatus`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        },
      )
      console.log("getEmailVerificationStatus", JSON.stringify(json, null, 2))
      return json.status
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
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
  const jwt = await generateJwt()
  try {
    const json = await fetcher(`${ARGENT_API_BASE_URL}/account/asyncRegister`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    console.log("register", JSON.stringify(json, null, 2))

    console.log("awaiting registration status…")

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
  const jwt = await generateJwt()
  try {
    const json: VerifyEmailResponse = await fetcher(
      `${ARGENT_API_BASE_URL}/verifyEmail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationCode,
        }),
      },
    )
    console.log("verifyEmail", JSON.stringify(json, null, 2))
    return json
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
    throw new Error("Failed to verify email")
  }
}

type RegistrationStatus = "notFound" | "registering" | "registered" | "failed"
export const getRegistrationStatus = async (): Promise<RegistrationStatus> => {
  const jwt = await generateJwt()
  try {
    const json = await fetcher(
      `${ARGENT_API_BASE_URL}/account/registrationStatus`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
    )
    console.log("getRegistrationStatus", JSON.stringify(json, null, 2))

    return json.status
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
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
  const jwt = await generateJwt()
  try {
    const json = await fetcher(
      `${ARGENT_API_BASE_URL}/accounts?application=argentx&chain=starknet`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
    )
    console.log("getAccounts", JSON.stringify(json, null, 2))

    return json.accounts
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
    throw new Error("Failed to get accounts")
  }
}

export interface UserAccount {
  email: string
  accounts: Account[]
}

export const getAccount = async (): Promise<UserAccount> => {
  const jwt = await generateJwt()
  const json = await fetcher(`${ARGENT_API_BASE_URL}/account`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
  })
  console.log("getAccount", JSON.stringify(json, null, 2))

  // if (!response.ok) {
  //   throw new Error("failed to get account")
  // }

  // const json = await response.json()

  // TODO: [BE] make atomic
  json.accounts = await getAccounts()
  console.log("getAccount with accounts", JSON.stringify(json, null, 2))

  return json
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
  if (signature.length !== 2) {
    throw new Error("only one signature supported")
  }

  const jwt = await generateJwt()
  try {
    const json = await fetcher(`${ARGENT_API_BASE_URL}/account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
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

    console.log("addAccount", JSON.stringify(json, null, 2))

    return json
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
    throw new Error("Failed to add account")
  }
}

export const cosignerSign = async (message: any) => {
  const jwt = await generateJwt()
  try {
    const json = await fetcher(`${ARGENT_API_BASE_URL}/cosigner/sign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    console.log("cosignerSign", JSON.stringify(json, null, 2))
    return json
  } catch (error) {
    IS_DEV && console.warn(coerceErrorToString(error))
    if (isFetcherError(error)) {
      if (error.responseJson?.status === "noMatchingAccountForUser") {
        throw new Error("Failed to co-sign - no matching account for user")
      }
    }
    throw new Error("Failed to co-sign")
  }
}
