export function parseIPFSUri(uri: string): string {
  return uri.startsWith("ipfs://")
    ? "https://cloudflare-ipfs.com/ipfs/" + uri.substring(7)
    : uri
}
