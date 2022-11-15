import * as z from "zod"

// TODO: [MISC] add zxcvbn password strength validation and error messages
export const passwordSchema = z.string().min(8)
