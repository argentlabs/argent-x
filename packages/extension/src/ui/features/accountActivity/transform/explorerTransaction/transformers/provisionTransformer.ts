import { IExplorerTransactionTransformer } from "./type"
import { ProvisionTransaction } from "../../type"
import { getParameter } from "../getParameter"
import { isEqualAddress } from "@argent/shared"
import { STRK_TOKEN_ADDRESS } from "../../../../../../shared/network/constants"
import { getTokenForContractAddress } from "../../getTokenForContractAddress"
import { PROVISION_CONTRACT_ADDRESSES } from "../../../../../../shared/api/constants"

const PROVISION_EVENT = "ClaimServed"

export default function ({
  tokensByNetwork,
  explorerTransaction,
  result,
}: IExplorerTransactionTransformer) {
  const eventsNames = explorerTransaction.events.map((event) => event.name)
  const { calls, events } = explorerTransaction

  const callWithClaim = calls?.find((call) => call.name === "claim")
  if (
    eventsNames.includes(PROVISION_EVENT) &&
    callWithClaim &&
    callWithClaim.address &&
    PROVISION_CONTRACT_ADDRESSES.find((address) =>
      isEqualAddress(address, callWithClaim.address),
    )
  ) {
    const entity = "TOKEN"
    const action = "PROVISION"
    const displayName = "Receive airdrop"
    const tokenAddress = STRK_TOKEN_ADDRESS

    const parameters =
      events.find((evt) => evt.name === PROVISION_EVENT)?.parameters ??
      undefined
    const fromAddress = callWithClaim.address
    const toAddress = getParameter(parameters, "recipient")
    const amount = getParameter(parameters, "amount")
    const token = getTokenForContractAddress(tokenAddress, tokensByNetwork)

    result = {
      ...result,
      action,
      entity,
      displayName,
      fromAddress,
      toAddress,
      amount,
      tokenAddress,
      token,
    } as ProvisionTransaction
    return result
  }
}
