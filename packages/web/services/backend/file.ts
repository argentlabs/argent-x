import { getJwt } from "../__unsafe__oldJwt"
import { ARGENT_API_BASE_URL } from "./account"

interface Metadata {
  [key: string]: string
}

type AccessPolicy =
  | "WEB_WALLET_SESSION"
  | "WEB_WALLET_USER"
  | "WEB_WALLET_OWNER"

interface PostFileRequest {
  metadata?: Metadata
  accessPolicy?: AccessPolicy
}

interface PostFileResponse {
  filename: string
  contentType: string
  accessPolicy: AccessPolicy
  created: string
  modified: string
  metadata?: Metadata
}

export const postTextFile = async (
  name: string,
  content: string,
  options?: PostFileRequest,
): Promise<PostFileResponse> => {
  const jwt = await getJwt()

  const blobJson = new Blob([content], {
    type: "text/plain",
  })

  const formData = new FormData()
  formData.append("file", blobJson, `${name}.txt`)
  if (options?.metadata) {
    formData.append("metadata", JSON.stringify(options.metadata))
  }
  if (options?.accessPolicy) {
    formData.append("accessPolicy", options.accessPolicy)
  }

  const response = await fetch(`${ARGENT_API_BASE_URL}/files/${name}.txt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  })

  const json = await response.json()
  return json
}

export const getJsonFile = async (name: string): Promise<string> => {
  const jwt = await getJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/files/${name}.txt`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })

  console.log("getJsonFile", "HTTP code", response.status)

  if (!response.ok) {
    throw new Error(`Failed to get file ${name}`)
  }

  const blob = await response.blob()
  const text = await blob.text()
  return text
}
