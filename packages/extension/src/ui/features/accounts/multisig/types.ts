export type MultisigStatus = "created" | "joined" | "pending"
export type MultisigAccount = {
  content: {
    address: string
    creator: string
    signers: string[]
    threshold: number
  }
}
