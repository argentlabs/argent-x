import type {
  Cosigner,
  CosignerMessage,
  CosignerOffchainMessage,
  CosignerResponse,
} from "@argent/x-guardian"
import type { AddSmartAccountResponse, BackendAccount } from "@argent/x-shared"
import { AddSmartAcountRequestSchema, BaseError } from "@argent/x-shared"
import retry from "async-retry"
import urlJoin from "url-join"
import { z } from "zod"
import { ampli } from "../../analytics"
import { ARGENT_API_BASE_URL } from "../../api/constants"
import { isFetcherError } from "../../api/fetcher"
import { IS_DEV } from "../../utils/dev"
import { coerceErrorToString } from "../../utils/error"
import { idb } from "../idb"
import { jwtFetcher } from "../jwtFetcher"

export const requestEmailAuthentication = async (
  email: string,
  locale = "en-EN",
) => {
  try {
    if (!ARGENT_API_BASE_URL) {
      throw new BaseError({ message: "Argent API base url is not set" })
    }

    const json = await jwtFetcher(
      urlJoin(ARGENT_API_BASE_URL, `account/requestEmailAuthentication`),
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
  } catch {
    throw new BaseError({ message: "failed to request email verification" })
  }
}

export const emailVerificationStatusSchema = z.enum([
  "expired",
  "maxAttemptsReached",
  "unverified",
  "verified",
  "notRequested",
])

export type EmailVerificationStatus = z.infer<
  typeof emailVerificationStatusSchema
>

export const emailVerificationStatusErrorSchema = z.object({
  name: z.string(),
  url: z.string().nullable(),
  status: z.number(),
  statusText: z.string(),
  responseText: z.string(),
  responseJson: z.object({
    status: emailVerificationStatusSchema,
  }),
})

export interface GetEmailVerificationStatusReponse {
  status: EmailVerificationStatus
}

export const getEmailVerificationStatus = async () => {
  try {
    const json = await jwtFetcher<GetEmailVerificationStatusReponse>(
      urlJoin(ARGENT_API_BASE_URL, `account/emailVerificationStatus`),
    )
    return json.status
  } catch {
    throw new BaseError({ message: "Failed to get email verification status" })
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

export const register = async () => {
  try {
    const json = await jwtFetcher<void>(
      urlJoin(ARGENT_API_BASE_URL, `account/asyncRegister`),
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    )

    await retry(
      async (bail) => {
        const registerStatus = await getRegistrationStatus()
        if (registerStatus === "registering") {
          throw new BaseError({ message: "not registered yet" })
        }
        if (registerStatus !== "registered") {
          bail(new BaseError({ message: "failed to register" }))
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
    if (IS_DEV) {
      console.warn(coerceErrorToString(error))
    }
    throw new BaseError({ message: "Failed to register" })
  }
}

interface VerifyEmailResponse {
  status: EmailVerificationStatus
  userRegistrationStatus: "registered" | "notRegistered"
}

export const verifyEmail = async (verificationCode: string) => {
  const json = await jwtFetcher<VerifyEmailResponse>(
    urlJoin(ARGENT_API_BASE_URL, `verifyEmail`),
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

interface GetRegistrationStatusResponse {
  status: RegistrationStatus
}

export const getRegistrationStatus = async () => {
  try {
    const json = await jwtFetcher<GetRegistrationStatusResponse>(
      urlJoin(ARGENT_API_BASE_URL, `account/registrationStatus`),
    )
    return json.status
  } catch {
    throw new BaseError({ message: "Failed to get registration status" })
  }
}

export const isTokenExpired = async () => {
  try {
    const res = await jwtFetcher<{ userId: string }>(
      urlJoin(ARGENT_API_BASE_URL, `account`),
    )

    ampli.identify(res.userId)

    await idb.ids.put({ key: "userId", id: res.userId })
    return false
  } catch (error) {
    if (IS_DEV) {
      console.warn(coerceErrorToString(error))
    }
  }
  return true
}

interface GetAccountsResponse {
  accounts: BackendAccount[]
}

export const getBackendAccounts = async () => {
  try {
    const json = await jwtFetcher<GetAccountsResponse>(
      urlJoin(
        ARGENT_API_BASE_URL,
        `accounts?application=argentx&chain=starknet`,
      ),
    )
    return json.accounts
  } catch {
    throw new BaseError({ message: "Failed to get accounts" })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddBackendAccountSchema = AddSmartAcountRequestSchema.extend({
  accountAddress: z.string().optional(),
})

type AddBackendAccountRequest = z.infer<typeof AddBackendAccountSchema>

export const addBackendAccount = async (request: AddBackendAccountRequest) => {
  const { accountAddress, name, icon, signature, implClassHash, ownerAddress } =
    request

  try {
    const json = await jwtFetcher<AddSmartAccountResponse>(
      urlJoin(ARGENT_API_BASE_URL, `account`),
      {
        method: "POST",
        body: JSON.stringify({
          chain: "starknet",
          application: "argentx",
          ownerAddress,
          ...(implClassHash && { implClassHash }),
          ...(accountAddress && { accountAddress }),
          ...(name && { name }),
          ...(icon && { icon }),
          signature,
          assignCosigner: true,
        }),
      },
    )
    const res = await jwtFetcher<{ userId: string }>(
      urlJoin(ARGENT_API_BASE_URL, `account`),
    )
    ampli.identify(res.userId)
    return json
  } catch (error) {
    if (isFetcherError(error) && error.responseJson.status) {
      throw new BaseError({ message: error.responseJson.status })
    } else {
      throw new BaseError({ message: "Failed to add account" })
    }
  }
}

export const cosignerSign: Cosigner = async (
  message: CosignerMessage | CosignerOffchainMessage,
  isOffchainMessage = false,
) => {
  const beEndpoint = isOffchainMessage
    ? "cosigner/personalSign"
    : `cosigner/sign`

  try {
    const json = await jwtFetcher<CosignerResponse>(
      urlJoin(ARGENT_API_BASE_URL, beEndpoint),
      {
        method: "POST",
        body: JSON.stringify(message),
      },
    )
    return json
  } catch (error) {
    if (isFetcherError(error) && error.status === 403) {
      throw new BaseError({
        message: "Smart Account token is expired",
      })
    }
    throw new BaseError({
      message: `This transaction failed as the cosigner could not provide a valid signature. Please contact support.`,
    })
  }
}

export const updateDeviceToken = async (token: string) => {
  const json = await jwtFetcher(
    urlJoin(ARGENT_API_BASE_URL, "account/device"),
    {
      method: "PUT",
      body: JSON.stringify({ token }),
    },
  )
  return json
}
