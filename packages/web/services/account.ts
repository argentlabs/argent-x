import { getJwt } from "./__unsafe__oldJwt"

const ARGENT_API_BASE_URL = "https://api.hydrogen.argent47.net/v1"

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
  const json = await response.json()
  return json.status
}

export const requestEmailVerification = async (
  email: string,
  locale = "en-EN",
): Promise<void> => {
  const jwt = await getJwt()
  const res = await fetch(
    `${ARGENT_API_BASE_URL}/account/requestEmailVerification`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        locale,
      }),
    },
  )
  if (!res.ok) {
    throw new Error("failed to request email verification")
  }
}

type EmailVerificationStatus =
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
    const json = await response.json()
    return json.status
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
  const json = await response.json()
  return json.status
}
