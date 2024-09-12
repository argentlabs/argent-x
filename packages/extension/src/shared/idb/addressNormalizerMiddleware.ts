import {
  DBCore,
  DBCoreAddRequest,
  DBCoreMutateRequest,
  DBCorePutRequest,
  Middleware,
} from "dexie"
import { Address, stripAddressZeroPadding } from "@argent/x-shared"

const normalizeAddress = (address: string): Address => {
  return stripAddressZeroPadding(address) as Address
}

export const sanitizeRecord = (record: any) => {
  const sanitizedRecord = { ...record } as Record<string, unknown>
  Object.keys(sanitizedRecord).forEach((key) => {
    if (
      typeof sanitizedRecord[key] === "string" &&
      (sanitizedRecord[key] as string).startsWith("0x")
    ) {
      sanitizedRecord[key] = normalizeAddress(sanitizedRecord[key] as string)
    }
  })
  return sanitizedRecord
}

const sanitizeRecords = (records: any[]) => {
  return records.map((record) => sanitizeRecord(record))
}

const addressNormalizerMiddleware = (): Middleware<DBCore> => {
  return {
    stack: "dbcore",
    name: "addressNormalizer",
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
              updatedReq = req as DBCoreAddRequest | DBCorePutRequest
              updatedReq.values = sanitizeRecords(req.values as any)
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

export default addressNormalizerMiddleware
