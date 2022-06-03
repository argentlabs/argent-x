import { useEffect, useState } from "react"
import { Status as StarkNetStatus } from "starknet"

import { messageStream } from "../../../shared/messages"
import { getTransactionStatus } from "../../services/backgroundTransactions"

function transformStatus(status: StarkNetStatus): Status {
  return ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2", "PENDING"].includes(status)
    ? "SUCCESS"
    : status === "REJECTED"
    ? "ERROR"
    : "PENDING"
}

type Status = "UNKNOWN" | "PENDING" | "SUCCESS" | "ERROR"

export const useTransactionStatus = (
  transactionHash?: string,
  network?: string,
): Status => {
  const [transactionStatus, setTransactionStatus] = useState<Status>("UNKNOWN")

  useEffect(() => {
    if (transactionHash && network) {
      getTransactionStatus(transactionHash, network).then(({ status }) => {
        if (status) {
          setTransactionStatus(transformStatus(status))
        } else {
          setTransactionStatus("UNKNOWN")
        }
      })
      messageStream.subscribe(([message]) => {
        if (message.type === "TRANSACTION_UPDATES") {
          const transaction = message.data.find(
            ({ hash }) => hash === transactionHash,
          )
          if (transaction) {
            setTransactionStatus(transformStatus(transaction.status))
          }
        }
      })
    }
  }, [transactionHash, network])

  return transactionStatus
}
