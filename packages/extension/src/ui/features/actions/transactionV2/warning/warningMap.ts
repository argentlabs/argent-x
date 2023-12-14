import { z } from "zod"
import {
  reasonsSchema,
  severitySchema,
} from "../../../../../shared/transactionReview/schema"

export const riskToColorMap: Record<z.infer<typeof severitySchema>, string> = {
  info: "accent.500",
  caution: "warning.500",
  high: "error.500",
  critical: "error.500",
}

export const riskToHeaderMap: Record<z.infer<typeof severitySchema>, string> = {
  info: "Double check",
  caution: "Caution",
  high: "High risk transaction",
  critical: "Critical risk transaction",
}
export const warningMap: Record<
  z.infer<typeof reasonsSchema>,
  {
    title: string
    description: string
  }
> = {
  undeployed_account: {
    title: "Sending to the correct account?",
    description:
      "The account you are sending to hasn't done any transactions, please double check the address",
  },
  contract_is_not_verified: {
    title: "Unverified smart contracts",
    description:
      "The dapp you're using has not opened its source code on the block explorers Starkscan or Voyager. This means that no one can check what the smart contract actually does. Make sure you trust the app before you proceed.",
  },
  approval_too_high: {
    title: "Approval of spending limit is too high",
    description:
      "You're approving one or more addresses to spend more tokens than you're using in this transaction. These funds will not be spent but you should not proceed if you don’t trust this app.",
  },
  unknown_token: {
    title: "Unknown token",
    description:
      "You're interacting with a token smart contract that is not known to our registries. Make sure that you trust the application and it is the correct token.",
  },
  contract_is_black_listed: {
    title: "Smart contract on unsafe list",
    description:
      "You are using a smart contract that is on our unsafe list for the following reason: [….]. We recommend that you reject the transaction.",
  },
  recipient_is_black_listed: {
    title: "Recipient on unsafe list",
    description:
      "You are sending to an unsafe contract that is blacklisted for the the following reason: [...].",
  },
  spender_is_black_listed: {
    title: "Spender on unsafe list",
    description:
      "You are allowing an unsafe contract to access your funds. We deem this contract unsafe for the following reason: […].",
  },
  operator_is_black_listed: {
    title: "Spender on unsafe list",
    description:
      "You are allowing an unsafe contract to access your funds. We deem this contract unsafe for the following reason: […].",
  },
  recipient_is_token_address: {
    title: "Unintentional burn of assets",
    description:
      "You're sending assets to a smart contract that defines a token. This will likely burn your assets (forever). Please double check if this is really your intent.",
  },
  account_upgrade_to_unknown_implementation: {
    title: "Loss of funds due to invalid update",
    description:
      "You're about to execute an update of your Argent Account which is not verified by us. This is a dangerous operation and might lead to loss of your funds. We strongly advise you to not move forward.",
  },
  account_state_change: {
    title: "Loss of funds due to ownership change",
    description:
      "You’re about to change the owner of your account. If you proceed with the transaction, you loose access to your funds. We strongly recommend that you reject the transaction.",
  },
  amount_mismatch_too_low: {
    title: "Poor trade/swap of tokens",
    description:
      "You are swapping two tokens at a poor exchange rate (more than 5%). Make sure that there aren't other options with better rates.",
  },
  amount_mismatch_too_high: {
    title: "Uncommon trade/swap of tokens",
    description:
      "You are swapping two tokens at a rate that is much better than current market rates. You receive more than you invest.  Double check if everything is correct.",
  },
  internal_service_issue: {
    title: "Internal issue",
    description:
      "An internal issue occurred. Please try again later. If the issue persists, please contact support.",
  },
  recipient_is_not_current_account: {
    title: "Sender address of token swap is different to receiver address",
    description:
      "You are sending tokens for swap, but you won't receive them. If this is not your intention, we strongly recommend to reject the transaction.",
  },
  src_token_black_listed: {
    title: "Trade of an unsafe token",
    description: "You are selling an unsafe token. Be aware of the risks.",
  },
  dst_token_black_listed: {
    title: "You are buying an unsafe token.",
    description: "You are buying an unsafe token. Be aware of the risks.",
  },
  token_a_black_listed: {
    title: "Use of an unsafe token",
    description: "You are using an unsafe token. Be aware of the risks.",
  },
  token_b_black_listed: {
    title: "Use of an unsafe token",
    description: "You are using an unsafe token. Be aware of the risks.",
  },
}
