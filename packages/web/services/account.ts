import { getJwt } from "./__unsafe__oldJwt"

const ARGENT_API_BASE_URL = "https://cloud-dev.argent-api.com/v1"

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

export const verifyEmail = async (
  verificationCode: string,
): Promise<EmailVerificationStatus> => {
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
