import { array, number, object, string } from "yup"

const cryptoValidation = object()
  .default(undefined)
  .optional()
  .shape({
    cipher: string().required(),
    ciphertext: string().required(),
    kdf: string().required(),
    mac: string().required(),
    cipherparams: object().required().shape({
      iv: string().required(),
    }),
    kdfparams: object().required().shape({
      salt: string().required(),
      n: number().required(),
      dklen: number().required(),
      p: number().required(),
      r: number().required(),
    }),
  })

export default object({
  // standard backup/keystore file
  address: string().required(),
  version: number().integer().required(),
  // one of both must be there
  crypto: cryptoValidation,
  Crypto: cryptoValidation,
  // ethers.js additions
  "x-ethers": object().required().shape({
    mnemonicCounter: string().required(),
    mnemonicCiphertext: string().required(),
    path: string().required(),
  }),
  // argent additions
  argent: object()
    .default(undefined)
    .optional()
    .shape({
      version: number().integer().min(1).max(1).required(),
      accounts: array().of(
        object()
          .optional()
          .shape({
            address: string().required(),
            network: string().required(),
            signer: object().required().shape({
              type: string().required(),
              derivationPath: string().required(),
            }),
          }),
      ),
    }),
}).test("crypto", "just one of crypto or Crypto must be present", (val) => {
  return !val.crypto !== !val.Crypto
})
