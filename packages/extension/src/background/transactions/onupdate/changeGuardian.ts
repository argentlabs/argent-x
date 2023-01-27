import { updateAccountDetails } from "../../../shared/account/update"
import { TransactionUpdateListener } from "./type"

export const handleChangeGuardianTransaction: TransactionUpdateListener =
  async (transactions) => {
    const changeGuardians = transactions.filter(
      (transaction) => transaction.meta?.isChangeGuardian,
    )
    if (changeGuardians.length > 0) {
      await updateAccountDetails(
        "guardian",
        changeGuardians.map((transaction) => transaction.account),
      )
    }
  }
