import { useQuery } from "../../hooks/useQuery"
import { parseQuery, sendQuerySchema } from "../../../shared/send/schema"

export const useSendQuery = () => {
  const query = useQuery()
  return parseQuery(query, sendQuerySchema)
}
