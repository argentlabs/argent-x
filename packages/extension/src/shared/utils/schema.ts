import { Schema } from "yup"

export async function assertSchema<T>(
  schema: Schema<T>,
  data: any,
): Promise<void> {
  const isValid = await schema.isValid(data)
  if (!isValid) {
    throw new Error(`Invalid data: ${JSON.stringify(data)}`)
  }
}
