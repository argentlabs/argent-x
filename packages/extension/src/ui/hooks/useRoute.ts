import { useLocation, useParams } from "react-router-dom"
import { flowSchema } from "../../shared/argentAccount/schema"
import { useQuery } from "./useQuery"

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

/** makes a returnTo parameter that captures current page location including query */

export const useCurrentPathnameWithQuery = () => {
  const location = useLocation()
  return `${location.pathname}${location.search}`
}
