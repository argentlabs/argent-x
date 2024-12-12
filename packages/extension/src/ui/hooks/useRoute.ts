import { useLocation, useParams } from "react-router-dom"
import { flowSchema } from "../../shared/argentAccount/schema"
import { useQuery } from "./useQuery"
import { addressSchema } from "@argent/x-shared"
import { routes } from "../../shared/ui/routes"

/** TODO: refactor: move hooks into /hooks folder in individual files */
/** hook to get the `returnTo` query parameter */

export const useReturnTo = () => {
  /** get() returns null for missing value, cleaner to return undefined */
  return useQuery().get("returnTo") || undefined
}

export const useRouteAccountAddress = () => {
  const { accountAddress } = useParams()
  return accountAddress
}

export const useRouteAccountId = () => {
  const { accountId } = useParams()
  return accountId
}

export const useRouteFlow = () => {
  const { flow } = useParams()
  return flowSchema.parse(flow)
}

export const useRouteRequestId = () => {
  const { requestId } = useParams()
  return requestId
}

export const useRouteSignerToRemove = () => {
  const { signerToRemove } = useParams()
  return signerToRemove
}

export const useRouteSignerToReplace = () => {
  const { signerToReplace } = useParams()
  return signerToReplace
}

export const useRouteEmailAddress = () => {
  return useQuery().get("email") || undefined
}

export const useRouteTransactionType = () => {
  const { transactionType } = useParams()
  return transactionType
}

export const useRouteTokenAddress = () => {
  const { tokenAddress } = useParams()
  return addressSchema.safeParse(tokenAddress).data
}

export const useRouteInvestmentPositionId = () => {
  const { investmentPositionId } = useParams()
  return investmentPositionId
}

export const useRouteInvestmentId = () => {
  const { investmentId } = useParams()
  return investmentId
}

/** makes a returnTo parameter that captures current page location including query and hash */

export const useCurrentPathnameWithQuery = () => {
  const location = useLocation()
  return `${location.pathname}${location.search}${location.hash}`
}

export const useRouteAccountDefi = () => {
  const route = routes.accountTokens()
  return `${route}#defi`
}
