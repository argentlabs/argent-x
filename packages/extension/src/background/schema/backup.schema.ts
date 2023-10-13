import { z } from "zod"

const cryptoValidation = z.object({
  cipher: z.string(),
  ciphertext: z.string(),
  kdf: z.string(),
  mac: z.string(),
  cipherparams: z.object({
    iv: z.string(),
  }),
  kdfparams: z.object({
    salt: z.string(),
    n: z.number(),
    dklen: z.number(),
    p: z.number(),
    r: z.number(),
  }),
})

const schema = z
  .object({
    // standard backup/keystore file
    address: z.string(),
    version: z.number().int(),
    // one of both must be there
    crypto: cryptoValidation.optional(),
    Crypto: cryptoValidation.optional(),
    // ethers.js additions
    "x-ethers": z.object({
      mnemonicCounter: z.string(),
      mnemonicCiphertext: z.string(),
      path: z.string(),
    }),
    // argent additions
    argent: z
      .object({
        version: z.number().int(),
        accounts: z
          .array(
            z.object({
              address: z.string().optional(),
              network: z.string().optional(),
              signer: z
                .object({
                  type: z.string(),
                  derivationPath: z.string(),
                })
                .optional(),
            }),
          )
          .optional(),
      })
      .optional(),
  })
  .refine((data) => !data.crypto !== !data.Crypto, {
    message: "Just one of crypto or Crypto must be present",
    path: ["crypto"],
  })

export default schema
