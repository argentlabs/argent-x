import * as z from "zod"

// PINs are 6 digits long and only numbers
export const pinSchema = z.string().regex(/^\d{6}$/)
