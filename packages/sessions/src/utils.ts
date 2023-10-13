import {
  AccountInterface,
  CallData,
  ProviderInterface,
  Signature,
  constants,
  hash,
  merkle,
  num,
  typedData,
} from "starknet"
import { ProviderInterface as ProviderInterfaceV4 } from "starknet4"

export interface Policy {
  contractAddress: string
  selector: string
}

export interface RequestSession {
  key: string
  expires: number
  policies: Policy[]
}

export interface PreparedSession extends RequestSession {
  root: string
}

export interface SignedSession extends PreparedSession {
  signature: Signature
}

export const SESSION_PLUGIN_CLASS_HASH =
  "0x31c70ed28f4b0faf39b2f97d8f0a61a36968319c13fe6f2051b8de5a15f3d9b"

// H(Policy(contractAddress:felt,selector:selector))
const POLICY_TYPE_HASH =
  "0x2f0026e78543f036f33e26a8f5891b88c58dc1e20cbbfaf0bb53274da6fa568"

export async function supportsSessions(
  address: string,
  provider: ProviderInterface | ProviderInterfaceV4,
): Promise<boolean> {
  const { result } = await provider.callContract({
    contractAddress: address,
    entrypoint: "isPlugin",
    calldata: CallData.compile({ classHash: SESSION_PLUGIN_CLASS_HASH }),
  })
  return num.toBigInt(result[0]) !== constants.ZERO
}

export function preparePolicy({ contractAddress, selector }: Policy): string {
  return hash.computeHashOnElements([
    POLICY_TYPE_HASH,
    contractAddress,
    typedData.prepareSelector(selector),
  ])
}

export function createMerkleTreeForPolicies(
  policies: Policy[],
): merkle.MerkleTree {
  return new merkle.MerkleTree(policies.map(preparePolicy))
}

export function prepareSession(session: RequestSession): PreparedSession {
  const { root } = createMerkleTreeForPolicies(session.policies)
  return { ...session, root }
}

export async function createSession(
  session: RequestSession,
  account: AccountInterface,
): Promise<SignedSession> {
  const { expires, key, policies, root } = prepareSession(session)
  const chainId = await account.getChainId()
  const signature = await account.signMessage({
    primaryType: "Session",
    types: {
      Policy: [
        { name: "contractAddress", type: "felt" },
        { name: "selector", type: "selector" },
      ],
      Session: [
        { name: "key", type: "felt" },
        { name: "expires", type: "felt" },
        { name: "root", type: "merkletree", contains: "Policy" },
      ],
      StarkNetDomain: [{ name: "chainId", type: "felt" }],
    },
    domain: {
      chainId,
    },
    message: {
      key,
      expires,
      root: policies, // we can pass the policy to the message, when argent x works with type merkletree (starknet.js update)
    },
  })
  return {
    key,
    policies,
    expires,
    root,
    signature,
  }
}
