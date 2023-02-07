import { FunctionInvocation, hash, uint256 } from "starknet"

import { ApprovalEvent, EventsToTrack, TransferEvent } from "./types"

export const EventsBySelector: { [key in EventsToTrack]: string } = {
  Transfer: hash.getSelectorFromName("Transfer"),
  Approval: hash.getSelectorFromName("Approval"),
}

export const findTransfersAndApprovals = (
  internalCalls: FunctionInvocation[],
  approvals: ApprovalEvent[],
  transfers: TransferEvent[],
) => {
  for (const internalCall of internalCalls) {
    const { events, internal_calls } = internalCall
    for (const event of events) {
      for (const key of event.keys) {
        if (key === EventsBySelector.Approval) {
          approvals.push({
            tokenAddress: internalCall.contract_address,
            owner: event.data[0],
            spender: event.data[1],
            value: uint256
              .uint256ToBN({ low: event.data[2], high: event.data[3] })
              .toString(),
          })
        }
        if (key === EventsBySelector.Transfer) {
          transfers.push({
            tokenAddress: internalCall.contract_address,
            from: event.data[0],
            to: event.data[1],
            value: uint256
              .uint256ToBN({ low: event.data[2], high: event.data[3] })
              .toString(),
          })
        }
      }
    }

    if (internal_calls) {
      findTransfersAndApprovals(internal_calls, approvals, transfers)
    }
  }

  return { approvals, transfers }
}
