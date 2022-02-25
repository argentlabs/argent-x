import { array, number, object, string } from "yup"

export default object({
  // standard backup/keystore file
  address: string().required(),
  version: number().integer().required(),
  Crypto: object()
    .required()
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
    }),
  // ethers.js additions
  "x-ethers": object().required().shape({
    mnemonicCounter: string().required(),
    mnemonicCiphertext: string().required(),
    path: string().required(),
  }),
  // argent additions
  argent: object()
    .required()
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
})
