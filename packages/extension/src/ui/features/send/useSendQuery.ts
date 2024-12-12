import { sendQuerySchema } from "../../../shared/send/schema"
import { useParseQuery } from "../../hooks/useParseQuery"

export const useSendQuery = () => {
  return useParseQuery(sendQuerySchema)
}
