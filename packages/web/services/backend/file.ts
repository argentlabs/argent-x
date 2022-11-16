import { getJwt } from "../__unsafe__oldJwt"
import { ARGENT_API_BASE_URL } from "./account"

interface Metadata {
  [key: string]: string
}

type AccessPolicy = "WEB_WALLET_KEY" | "WEB_WALLET_SESSION" | "DEFAULT"

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

export const getTextFile = async (name: string): Promise<string> => {
  const jwt = await getJwt()
  const response = await fetch(`${ARGENT_API_BASE_URL}/files/${name}.txt`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })

  console.log("getTextFile", "HTTP code", response.status)

  if (!response.ok) {
    switch (response.status) {
      case 404:
        throw new Error("file not found")
      case 401:
        throw new Error("unauthorized")
      default:
        throw new Error(`failed to get file`)
    }
  }

  const blob = await response.blob()
  const text = await blob.text()
  return text
}
