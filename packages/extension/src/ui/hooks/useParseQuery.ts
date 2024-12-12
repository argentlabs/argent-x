import type { z } from "zod"
import { useQuery } from "./useQuery"

export const useParseQuery = <T extends z.ZodSchema>(
  schema: T,
): z.output<T> => {
  const query = useQuery()
  return parseQuery(query, schema)
}

export const parseQuery = <T extends z.ZodSchema>(
  query: URLSearchParams,
  schema: T,
): z.output<T> => {
  const unknownValues: Record<string, string> = {}
  for (const [key, value] of query.entries()) {
    unknownValues[key] = value
  }
  const result = schema.safeParse(unknownValues)
  return result.success ? result.data : {}
}
