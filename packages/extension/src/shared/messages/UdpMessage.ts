import { DeclareContract, DeployContract } from "./../udp/type"

export type UdpMessage =
  | { type: "REQUEST_DECLARE_CONTRACT"; data: DeclareContract }
  | { type: "REQUEST_DECLARE_CONTRACT_RES"; data: { actionHash: string } }
  | {
      type: "REQUEST_DECLARE_CONTRACT_REJ"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "DECLARE_CONTRACT"
      data: { address: string; contract: any }
    }
  | {
      type: "DECLARE_CONTRACT_RES"
    }
  | {
      type: "DECLARE_CONTRACT_REJ"
    }
  | {
      type: "DECLARE_CONTRACT_ACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "DECLARE_CONTRACT_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | { type: "REQUEST_DEPLOY_CONTRACT"; data: DeployContract }
  | { type: "REQUEST_DEPLOY_CONTRACT_RES"; data: { actionHash: string } }
  | {
      type: "REQUEST_DEPLOY_CONTRACT_REJ"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "DEPLOY_CONTRACT_ACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "DEPLOY_CONTRACT_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
