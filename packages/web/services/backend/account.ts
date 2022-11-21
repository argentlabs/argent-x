import retry from "async-retry"

import { getJwt } from "../__unsafe__oldJwt"

export const ARGENT_API_BASE_URL = "https://cloud-dev.argent-api.com/v1"

type EnsFreeStatus =
  | "taken"
  | "alreadyReserved"
  | "blacklisted"
  | "toBeReserved"
  | "notUTS46"
  | "userAlreadyRegistered"
export const isEnsFree = async (ens: string): Promise<EnsFreeStatus> => {
  const jwt = await getJwt()
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
  const jwt = await getJwt()
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
  const jwt = await getJwt()
  const res = await fetch(
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
        application: "webwallet",
      }),
    },
  )
  if (!res.ok) {
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
    const jwt = await getJwt()
    const response = await fetch(
      `${ARGENT_API_BASE_URL}/account/emailVerificationStatus`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("failed to get email verification status")
    }

    const json = await response.json()
    return json.status
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
  const jwt = await getJwt()
  const res = await fetch(`${ARGENT_API_BASE_URL}/account/asyncRegister`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    throw new Error("failed to register")
  }

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
}

interface VerifyEmailResponse {
  status: EmailVerificationStatus
  userRegistrationStatus: "registered" | "notRegistered"
}

export const verifyEmail = async (
  verificationCode: string,
): Promise<VerifyEmailResponse> => {
  const jwt = await getJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/verifyEmail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      verificationCode,
    }),
  })

  if (!response.ok) {
    throw new Error("failed to verify email")
  }

  const json = await response.json()

  return json
}

type RegistrationStatus = "notFound" | "registering" | "registered" | "failed"
export const getRegistrationStatus = async (): Promise<RegistrationStatus> => {
  const jwt = await getJwt()
  const response = await fetch(
    `${ARGENT_API_BASE_URL}/account/registrationStatus`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    throw new Error("failed to get registration status")
  }

  const json = await response.json()
  return json.status
}

interface Account {
  name: string
  address: string
  ownerAddress: string
  chain: "ethereum" | "zksync" | "zksync2" | "starknet"
  deploymentStatus: "notDeployed" | "deploying" | "deployed" | "deployError"
  application: "mobile" | "webwallet" | "argentx"
  guardianAddresses: string[]
}

export const getAccounts = async (): Promise<Account[]> => {
  const jwt = await getJwt()
  const response = await fetch(
    `${ARGENT_API_BASE_URL}/accounts?application=webwallet&chain=starknet`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    throw new Error("failed to get accounts")
  }

  const json = await response.json()
  return json.accounts
}

interface UserAccount {
  email: string
  accounts: Account[]
}

export const getAccount = async (): Promise<UserAccount> => {
  const jwt = await getJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/account`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("failed to get account")
  }

  const json = await response.json()

  // TODO: [BE] make atomic
  json.accounts = await getAccounts()

  return json
}

interface AddAccountResponse {
  address: string
  guardianAddress?: string
}

export const addAccount = async (
  pubKey: string,
  signature: string[],
): Promise<AddAccountResponse> => {
  if (signature.length !== 2) {
    throw new Error("only one signature supported")
  }

  const jwt = await getJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chain: "starknet",
      application: "webwallet",
      ownerAddress: pubKey,
      signature: {
        r: signature[0],
        s: signature[1],
      },
      assignCosigner: false,
    }),
  })

  if (!response.ok) {
    throw new Error("failed to add account")
  }

  const json = await response.json()
  return json
}
