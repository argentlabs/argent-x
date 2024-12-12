import type { DeclareContract } from "../udc/schema"

export type UdcMessage =
  | {
      type: "REQUEST_DECLARE_CONTRACT"
      data: Omit<DeclareContract, "feeTokenAddress">
    }
  | { type: "REQUEST_DECLARE_CONTRACT_RES"; data: { actionHash: string } }
  | {
      type: "REQUEST_DECLARE_CONTRACT_REJ"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "DECLARE_CONTRACT_ACTION_SUBMITTED"
      data: {
        txHash: string
        classHash: string
        actionHash: string
      }
    }
  | {
      type: "DECLARE_CONTRACT_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "REQUEST_DEPLOY_CONTRACT_REJ"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "DEPLOY_CONTRACT_ACTION_SUBMITTED"
      data: {
        txHash: string
        deployedContractAddress: string
        actionHash: string
      }
    }
  | {
      type: "DEPLOY_CONTRACT_ACTION_FAILED"
      data: { actionHash: string; error: string }
    }
