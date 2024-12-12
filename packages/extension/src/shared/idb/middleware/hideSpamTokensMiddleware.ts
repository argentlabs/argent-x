import { stripAddressZeroPadding } from "@argent/x-shared"
import type {
  DBCore,
  DBCoreAddRequest,
  DBCoreMutateRequest,
  DBCorePutRequest,
  DBCoreTable,
  Middleware,
} from "dexie"
import type { Token } from "../../token/__new/types/token.model"

export const processRecord = (record: Token, existingRecord?: Token) => {
  // Check for "scam" in tags and set hidden flag only if it did not have the tag before
  if (
    record.tags?.includes("scam") &&
    !existingRecord?.tags?.includes("scam")
  ) {
    record.hidden = true
  }

  return record
}

const processRecords = async (
  request: DBCoreAddRequest | DBCorePutRequest,
  table: DBCoreTable,
) => {
  const records = request.values as Token[]

  return Promise.all(
    records.map(async (record) => {
      let existingRecord
      if (request.type === "add") {
        existingRecord = undefined
      } else {
        existingRecord = await table.get({
          trans: request.trans,
          key: [stripAddressZeroPadding(record.address), record.networkId],
        })
      }
      return processRecord(record, existingRecord)
    }),
  )
}

const hideSpamTokensMiddleware = (): Middleware<DBCore> => {
  return {
    stack: "dbcore",
    name: "hideSpamTokens",
    create: (downlevelDatabase: DBCore) => ({
      ...downlevelDatabase,
      table: (tableName: string) => {
        const downlevelTable = downlevelDatabase.table(tableName)
        return {
          ...downlevelTable,
          mutate: async (req: DBCoreMutateRequest) => {
            const { type } = req
            let updatedReq = req
            if (type === "add" || type === "put") {
              if (tableName === "tokens") {
                updatedReq = req as DBCoreAddRequest | DBCorePutRequest
                updatedReq.values = await processRecords(req, downlevelTable)
              }
            }
            return downlevelTable.mutate(updatedReq).then((res) => {
              return res
            })
          },
        }
      },
    }),
  }
}

export default hideSpamTokensMiddleware
