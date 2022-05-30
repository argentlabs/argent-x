import { HandleMessage, UnhandledMessage } from "../background"

export const handleTransactionMessage: HandleMessage = async ({
  msg,
  background: { transactionTracker, actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_TRANSACTIONS": {
      const transactions = await transactionTracker.getAll()

      return sendToTabAndUi({
        type: "GET_TRANSACTIONS_RES",
        data: transactions,
      })
    }

    case "GET_TRANSACTION": {
      const tracked = await transactionTracker.get(msg.data.hash)
      if (tracked) {
        return sendToTabAndUi({
          type: "GET_TRANSACTION_RES",
          data: tracked,
        })
      }

      return sendToTabAndUi({
        type: "GET_TRANSACTION_REJ",
      })
    }

    case "EXECUTE_TRANSACTION": {
      const { meta } = await actionQueue.push({
        type: "TRANSACTION",
        payload: msg.data,
      })
      return sendToTabAndUi({
        type: "EXECUTE_TRANSACTION_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }
  }

  throw new UnhandledMessage()
}
